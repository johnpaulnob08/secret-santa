const express = require('express');
const router = express.Router();
const firebase = require('../services/firebase');
const { generateAssignments, validateAssignments } = require('../utils/shuffle');

// POST /api/shuffle/:groupId - Generate assignments
router.post('/:groupId', async (req, res) => {
  try {
    const group = await firebase.getGroup(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status === 'sent') {
      return res.status(400).json({ error: 'Emails already sent for this group' });
    }
    if (!group.participants || group.participants.length < 4) {
      return res.status(400).json({ error: 'At least 4 participants are required' });
    }

    const assignments = generateAssignments(group.participants);
    
    if (!validateAssignments(assignments)) {
      return res.status(500).json({ error: 'Generated assignments failed validation' });
    }

    await firebase.saveAssignments(req.params.groupId, assignments);

    // Return assignments (admin can see all, but we tag them as "server-verified")
    res.json({
      message: 'Assignments generated successfully',
      assignmentCount: assignments.length,
      // Only return giver names so admin can verify everyone is included
      summary: assignments.map(a => ({ giverName: a.giverName, giverEmail: a.giverEmail }))
    });
  } catch (err) {
    console.error(err);
    if (err.message.includes('valid Secret Santa')) {
      return res.status(500).json({ error: 'Could not generate valid assignments. Please try again.' });
    }
    res.status(500).json({ error: err.message || 'Failed to generate assignments' });
  }
});

module.exports = router;
