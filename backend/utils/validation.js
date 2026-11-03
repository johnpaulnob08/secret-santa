const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

function sanitizeString(str, maxLength = 200) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().substring(0, maxLength).replace(/[<>]/g, '');
}

function validateParticipant(participant) {
  const errors = [];
  if (!participant.name || participant.name.trim().length < 1) {
    errors.push('Participant name is required');
  }
  if (!validateEmail(participant.email)) {
    errors.push(`Invalid email: ${participant.email}`);
  }
  return errors;
}

function validateGroupData(data) {
  const errors = [];
  if (!data.groupName || data.groupName.trim().length < 2) {
    errors.push('Group name must be at least 2 characters');
  }
  if (!data.adminEmail || !validateEmail(data.adminEmail)) {
    errors.push('Valid admin email is required');
  }
  if (!Array.isArray(data.participants)) {
    errors.push('Participants must be an array');
    return errors;
  }
  if (data.participants.length < 4) {
    errors.push('Minimum 4 participants required');
  }
  if (data.participants.length > 30) {
    errors.push('Maximum 30 participants allowed');
  }

  // Check for duplicate emails
  const emails = data.participants.map(p => p.email?.toLowerCase?.());
  const uniqueEmails = new Set(emails);
  if (uniqueEmails.size !== emails.length) {
    errors.push('Duplicate email addresses are not allowed');
  }

  // Validate each participant
  data.participants.forEach((p, i) => {
    const pErrors = validateParticipant(p);
    pErrors.forEach(e => errors.push(`Participant ${i + 1}: ${e}`));
  });

  return errors;
}

module.exports = { validateEmail, sanitizeString, validateParticipant, validateGroupData };
