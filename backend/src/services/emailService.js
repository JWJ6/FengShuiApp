const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationCode = async (toEmail, code) => {
  const mailOptions = {
    from: `"FengShui App" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Your Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; text-align: center;">FengShui App</h2>
        <p style="color: #555; text-align: center;">Your verification code is:</p>
        <div style="background: #f7f7f7; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e74c3c;">${code}</span>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">This code expires in 10 minutes.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationCode };
