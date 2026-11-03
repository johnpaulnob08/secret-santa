export const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const validateEmail = (email) => {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

export const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

export const statusColor = (status) => {
  switch (status) {
    case 'sent': return 'var(--green-light)';
    case 'failed': return 'var(--red)';
    default: return 'var(--text3)';
  }
};
