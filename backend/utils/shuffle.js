/**
 * Generates a valid Secret Santa assignment using a derangement algorithm.
 * Rules:
 * 1. No self-assignment
 * 2. No mutual pairs (if A -> B, then B -/-> A)
 * 3. Every person gives and receives exactly once
 */
function generateAssignments(participants) {
  if (participants.length < 4) {
    throw new Error('Minimum 4 participants required');
  }
  if (participants.length > 30) {
    throw new Error('Maximum 30 participants allowed');
  }

  const emails = participants.map(p => p.email);
  const MAX_ATTEMPTS = 1000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const assignment = tryAssign(emails);
    if (assignment) {
      // Map back to participant objects
      return assignment.map(([giverEmail, receiverEmail]) => {
        const giver = participants.find(p => p.email === giverEmail);
        const receiver = participants.find(p => p.email === receiverEmail);
        return {
          giverId: giverEmail,
          giverName: giver.name,
          giverEmail: giver.email,
          receiverId: receiverEmail,
          receiverName: receiver.name,
          receiverEmail: receiver.email,
          receiverWishlist: receiver.wishlist || null
        };
      });
    }
  }

  throw new Error('Could not generate valid Secret Santa assignments after max attempts');
}

function tryAssign(emails) {
  const shuffled = fisherYatesShuffle([...emails]);

  // Build assignments: emails[i] -> shuffled[i]
  for (let i = 0; i < emails.length; i++) {
    const giver = emails[i];
    const receiver = shuffled[i];

    // Rule 1: No self-assignment
    if (giver === receiver) return null;

    // Rule 2: No mutual pairs
    // Find what shuffled[j] is for the index j where emails[j] === receiver
    const receiverIndex = emails.indexOf(receiver);
    if (shuffled[receiverIndex] === giver) return null;
  }

  return emails.map((email, i) => [email, shuffled[i]]);
}

function fisherYatesShuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Validates that a set of assignments is correct
 */
function validateAssignments(assignments) {
  const givers = new Set(assignments.map(a => a.giverEmail));
  const receivers = new Set(assignments.map(a => a.receiverEmail));

  // Every participant gives exactly once
  if (givers.size !== assignments.length) return false;

  // Every participant receives exactly once
  if (receivers.size !== assignments.length) return false;

  for (const assignment of assignments) {
    // No self-assignment
    if (assignment.giverEmail === assignment.receiverEmail) return false;

    // No mutual pairs
    const reverse = assignments.find(
      a => a.giverEmail === assignment.receiverEmail && a.receiverEmail === assignment.giverEmail
    );
    if (reverse) return false;
  }

  return true;
}

module.exports = { generateAssignments, validateAssignments };
