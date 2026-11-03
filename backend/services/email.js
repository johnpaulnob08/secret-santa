const { BrevoClient } = require('@getbrevo/brevo');

function getEmailClient() {
  return new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildEmailHtml({ giverName, receiverName, receiverWishlist, groupName, eventDescription, exchangeDate, budget, customMessage }) {
  const serif = "Georgia,'Times New Roman',serif";
  const sans = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";

  const details = [];
  if (exchangeDate) {
    const d = new Date(exchangeDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    details.push(['📅', 'Exchange date', d]);
  }
  if (budget) details.push(['💰', 'Budget', budget]);

  const detailsBlock = details.length ? `
    <tr><td style="padding:8px 36px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eadfce;">
        ${details.map(([icon, label, value]) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eadfce;font-family:${sans};font-size:14px;color:#7a6a58;">${icon}&nbsp; ${label}</td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid #eadfce;font-family:${sans};font-size:14px;font-weight:700;color:#2b2118;">${esc(value)}</td>
        </tr>`).join('')}
      </table>
    </td></tr>` : '';

  const wishlistBlock = receiverWishlist ? `
    <tr><td style="padding:24px 36px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f8f4;border-radius:12px;border-left:4px solid #2d6a4f;">
        <tr><td style="padding:18px 20px;">
          <div style="font-family:${sans};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#2d6a4f;font-weight:700;">🎁 Their wishlist</div>
          <div style="font-family:${sans};font-size:15px;line-height:1.6;color:#2b2118;margin-top:8px;">${esc(receiverWishlist)}</div>
        </td></tr>
      </table>
    </td></tr>` : '';

  const descriptionBlock = eventDescription ? `
    <tr><td style="padding:20px 36px 0;font-family:${sans};font-size:14px;line-height:1.6;color:#7a6a58;">${esc(eventDescription)}</td></tr>` : '';

  const messageBlock = customMessage ? `
    <tr><td style="padding:24px 36px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff4e0;border-radius:12px;">
        <tr><td style="padding:18px 20px;">
          <div style="font-family:${sans};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#b7791f;font-weight:700;">💌 From the organizer</div>
          <div style="font-family:${serif};font-size:16px;font-style:italic;line-height:1.6;color:#2b2118;margin-top:8px;">“${esc(customMessage)}”</div>
        </td></tr>
      </table>
    </td></tr>` : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#12372a;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Shh… your Secret Santa for ${esc(groupName)} is ready 🤫</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#12372a;">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fffaf3;border-radius:20px;overflow:hidden;">
        <tr><td bgcolor="#b3202a" align="center" style="background:#b3202a;padding:44px 32px 36px;">
          <div style="font-size:52px;line-height:1;">🎅</div>
          <div style="font-family:${serif};font-size:34px;font-weight:700;color:#ffffff;margin-top:12px;">Secret Santa</div>
          <div style="font-family:${sans};font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#ffd9d9;margin-top:10px;">${esc(groupName)}</div>
        </td></tr>
        <tr><td>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td height="6" bgcolor="#2d6a4f" style="height:6px;font-size:0;line-height:0;">&nbsp;</td>
            <td height="6" bgcolor="#e9b44c" style="height:6px;font-size:0;line-height:0;">&nbsp;</td>
            <td height="6" bgcolor="#2d6a4f" style="height:6px;font-size:0;line-height:0;">&nbsp;</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:36px 36px 0;font-family:${serif};font-size:22px;color:#2b2118;">Ho ho ho, <strong>${esc(giverName)}</strong>! 🎄</td></tr>
        <tr><td style="padding:8px 36px 0;font-family:${sans};font-size:15px;line-height:1.6;color:#7a6a58;">Your Secret Santa assignment has arrived. Here is who you’re gifting:</td></tr>
        <tr><td style="padding:24px 36px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:2px dashed #b3202a;border-radius:16px;">
            <tr><td align="center" style="padding:30px 20px;">
              <div style="font-family:${sans};font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#9a8a78;">You are gifting</div>
              <div style="font-family:${serif};font-size:42px;font-weight:700;color:#b3202a;margin-top:10px;line-height:1.15;">${esc(receiverName)}</div>
              <div style="font-family:${sans};font-size:13px;color:#9a8a78;margin-top:14px;">🤫 Keep it secret until the big reveal!</div>
            </td></tr>
          </table>
        </td></tr>
        ${wishlistBlock}
        ${detailsBlock}
        ${descriptionBlock}
        ${messageBlock}
        <tr><td style="padding:32px 36px 36px;font-family:${sans};font-size:12px;line-height:1.6;color:#a89a88;text-align:center;">
          Please don’t share your assignment with anyone. Happy gifting! 🎁<br>Sent with Secret Santa App 🎅
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendSecretSantaEmail({ giver, receiver, group }) {
  const client = getEmailClient();

  const response = await client.transactionalEmails.sendTransacEmail({
    subject: `🎅 Your Secret Santa Assignment - ${group.name}`,
    htmlContent: buildEmailHtml({
      giverName: giver.name,
      receiverName: receiver.name,
      receiverWishlist: receiver.wishlist,
      groupName: group.name,
      eventDescription: group.description,
      exchangeDate: group.exchangeDate,
      budget: group.budget,
      customMessage: group.customMessage
    }),
    sender: {
      name: 'Secret Santa 🎅',
      email: process.env.BREVO_SENDER_EMAIL || 'noreply@secretsanta.app'
    },
    to: [{ email: giver.email, name: giver.name }]
  });

  return response;
}

async function sendBulkEmails(group, assignments) {
  const results = [];

  for (const assignment of assignments) {
    const giver = group.participants.find(p => p.email === assignment.giverEmail);
    const receiver = group.participants.find(p => p.email === assignment.receiverEmail);

    try {
      await sendSecretSantaEmail({ giver, receiver, group: { ...group, name: group.groupName } });
      results.push({ email: giver.email, status: 'sent' });
    } catch (err) {
      console.error(`Failed to send email to ${giver.email}:`, err.message);
      results.push({ email: giver.email, status: 'failed', error: err.message });
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return results;
}

module.exports = { sendBulkEmails, sendSecretSantaEmail };