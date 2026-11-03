const admin = require('firebase-admin');

let db = null;

function getDb() {
  if (!db) {
    if (!admin.apps.length) {
      // Support both JSON string and individual env vars
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } else {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
          })
        });
      }
    }
    db = admin.firestore();
  }
  return db;
}

// Groups
async function createGroup(groupData) {
  const db = getDb();
  const ref = await db.collection('groups').add({
    ...groupData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'draft' // draft | shuffled | sent
  });
  const doc = await ref.get();
  return { id: ref.id, ...doc.data() };
}

async function getGroup(groupId) {
  const db = getDb();
  const doc = await db.collection('groups').doc(groupId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getGroupsByAdmin(adminEmail) {
  const db = getDb();
  const snapshot = await db.collection('groups')
    .where('adminEmail', '==', adminEmail)
    .get();

  // Sort in memory instead of using orderBy (no index needed)
  const groups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  groups.sort((a, b) => {
    const aTime = a.createdAt?._seconds || 0;
    const bTime = b.createdAt?._seconds || 0;
    return bTime - aTime;
  });
  return groups;
}

async function updateGroup(groupId, data) {
  const db = getDb();
  await db.collection('groups').doc(groupId).update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return getGroup(groupId);
}

async function deleteGroup(groupId) {
  const db = getDb();
  await db.collection('groups').doc(groupId).delete();
}

async function saveAssignments(groupId, assignments) {
  const db = getDb();
  await db.collection('groups').doc(groupId).update({
    assignments,
    status: 'shuffled',
    shuffledAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function updateParticipantEmailStatus(groupId, email, status) {
  const db = getDb();
  const group = await getGroup(groupId);
  if (!group) return;
  
  const participants = group.participants.map(p => {
    if (p.email === email) {
      return { ...p, emailStatus: status };
    }
    return p;
  });
  
  await db.collection('groups').doc(groupId).update({
    participants,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

async function markEmailsSent(groupId) {
  const db = getDb();
  await db.collection('groups').doc(groupId).update({
    status: 'sent',
    emailsSentAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

module.exports = {
  createGroup,
  getGroup,
  getGroupsByAdmin,
  updateGroup,
  deleteGroup,
  saveAssignments,
  updateParticipantEmailStatus,
  markEmailsSent
};
