import nodemailer from "nodemailer";

export const sendResetPasswordEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "Gmail", // Replace with your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Password",
    html: `<p>You requested to reset your password. Click the link below to set a new password:</p>
           <a href="${resetUrl}" target="_blank">${resetUrl}</a>
           <p>This link is valid for 1 hour.</p>`,
  };

  await transporter.sendMail(mailOptions);
};
