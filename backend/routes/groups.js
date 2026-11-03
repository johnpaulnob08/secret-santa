const express = require('express');
const router = express.Router();
const firebase = require('../services/firebase');
const { validateGroupData, sanitizeString, validateEmail } = require('../utils/validation');

// GET /api/groups/:adminEmail - Get all groups for an admin
router.get('/admin/:adminEmail', async (req, res) => {
  try {
    const { adminEmail } = req.params;
    if (!validateEmail(adminEmail)) {
      return res.status(400).json({ error: 'Invalid admin email' });
    }
    const groups = await firebase.getGroupsByAdmin(adminEmail.toLowerCase());
    res.json({ groups });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// GET /api/groups/:id - Get a specific group
router.get('/:id', async (req, res) => {
  try {
    const group = await firebase.getGroup(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    // Don't expose assignments to the public
    const { assignments, ...safeGroup } = group;
    res.json({ group: safeGroup });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// POST /api/groups - Create a group
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const errors = validateGroupData(data);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const groupData = {
      groupName: sanitizeString(data.groupName, 100),
      adminEmail: data.adminEmail.toLowerCase().trim(),
      adminName: sanitizeString(data.adminName || 'Organizer', 100),
      description: sanitizeString(data.description || '', 500),
      exchangeDate: data.exchangeDate || null,
      customMessage: sanitizeString(data.customMessage || '', 500),
      budget: data.budget ? sanitizeString(String(data.budget), 50) : null,
      participants: data.participants.map(p => ({
        name: sanitizeString(p.name, 100),
        email: p.email.toLowerCase().trim(),
        wishlist: sanitizeString(p.wishlist || '', 300),
        emailStatus: 'pending'
      }))
    };

    const group = await firebase.createGroup(groupData);
    res.status(201).json({ group, message: 'Group created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// PUT /api/groups/:id - Update a group (only if not sent)
router.put('/:id', async (req, res) => {
  try {
    const group = await firebase.getGroup(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status === 'sent') {
      return res.status(400).json({ error: 'Cannot edit a group after emails have been sent' });
    }

    const data = req.body;
    const errors = validateGroupData({ ...data, participants: data.participants || group.participants });
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const updateData = {
      groupName: sanitizeString(data.groupName, 100),
      description: sanitizeString(data.description || '', 500),
      exchangeDate: data.exchangeDate || null,
      customMessage: sanitizeString(data.customMessage || '', 500),
      budget: data.budget ? sanitizeString(String(data.budget), 50) : null,
      participants: (data.participants || group.participants).map(p => ({
        name: sanitizeString(p.name, 100),
        email: p.email.toLowerCase().trim(),
        wishlist: sanitizeString(p.wishlist || '', 300),
        emailStatus: p.emailStatus || 'pending'
      })),
      status: 'draft',
      assignments: null
    };

    const updated = await firebase.updateGroup(req.params.id, updateData);
    res.json({ group: updated, message: 'Group updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// DELETE /api/groups/:id - Delete a group
router.delete('/:id', async (req, res) => {
  try {
    const group = await firebase.getGroup(req.params.id);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    
    await firebase.deleteGroup(req.params.id);
    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

module.exports = router;
