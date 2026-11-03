const express = require('express');
const router = express.Router();
const firebase = require('../services/firebase');
const { sendBulkEmails } = require('../services/email');

// POST /api/email/send/:groupId - Send all Secret Santa emails
router.post('/send/:groupId', async (req, res) => {
  try {
    const group = await firebase.getGroup(req.params.groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (group.status === 'sent') {
      return res.status(400).json({ error: 'Emails have already been sent for this group' });
    }
    if (group.status !== 'shuffled' || !group.assignments) {
      return res.status(400).json({ error: 'Assignments must be generated before sending emails' });
    }

    // Send emails
    const results = await sendBulkEmails(group, group.assignments);

    // Update participant statuses
    for (const result of results) {
      await firebase.updateParticipantEmailStatus(req.params.groupId, result.email, result.status);
    }

    const allSent = results.every(r => r.status === 'sent');
    if (allSent) {
      await firebase.markEmailsSent(req.params.groupId);
    }

    const sent = results.filter(r => r.status === 'sent').length;
    const failed = results.filter(r => r.status === 'failed').length;

    res.json({
      message: allSent ? 'All emails sent successfully!' : `Emails sent with ${failed} failure(s)`,
      results,
      sent,
      failed,
      total: results.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send emails: ' + err.message });
  }
});

module.exports = router;
