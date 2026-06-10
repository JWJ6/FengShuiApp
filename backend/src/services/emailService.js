const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'FengShui Master <noreply@testyourfortune.com>';

const sendVerificationCode = async (toEmail, code) => {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: toEmail,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; text-align: center;">FengShui Master</h2>
        <p style="color: #555; text-align: center;">Your verification code is:</p>
        <div style="background: #f7f7f7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e74c3c;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">This code expires in 10 minutes.</p>
      </div>
    `,
  });
};

module.exports = { sendVerificationCode };
