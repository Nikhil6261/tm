import nodemailer from 'nodemailer';

const emailService = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "nikkuahirwar2@gmail.com",        // your Gmail
    pass: "aygj dytn uitj omsq"            // your App Password
  },
});


export const sendmail = async (userDetail, title , desc , deadline_date) => {
  try {
    const info = await emailService.sendMail({
      from: "'nikhil' <nikkuahirwar2@gmail.com>",
      to: userDetail.email,
      subject: title,
      text: desc,
      html: ` 
      <p>Hi ${userDetail.user_name},</p>
      <p>This is a quick update regarding your task:</p>
    <ul>
      <li><strong>Title:</strong> ${title}</li>
      <li><strong>Description:</strong> ${desc}</li>
      <li><strong>Deadline:</strong> ${deadline_date}</li>
    </ul>
    
    <p>If you have any questions, feel free to contact us.</p>
    <p>Best regards,<br/>Task Manager Team</p>
  `,
    });

    console.log("Email sent: " + info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}


export async function sendOTP(verifycode, email) {
  const mailOptions = {
    from: '"Nikhil" <nikkuahirwar2@gmail.com>',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${verifycode}`, // fallback for plain-text clients
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>OTP Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f7fa;
            padding: 20px;
          }
          .container {
            max-width: 480px;
            margin: auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            margin: 20px 0;
            letter-spacing: 8px;
          }
          .footer {
            margin-top: 30px;
            font-size: 13px;
            color: #7f8c8d;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>🔐 Your OTP Code</h2>
          <p>Use the following One-Time Password (OTP) to complete your action:</p>
          <div class="otp">${verifycode}</div>
          <p>This code is valid for the next <strong>5 minutes</strong>. Please do not share it with anyone.</p>
          <div class="footer">
            If you did not request this OTP, you can safely ignore this email.
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await emailService.sendMail(mailOptions);
    console.log('OTP email sent successfully');
    return true;
  } catch (err) {
    console.error('Failed to send OTP email:', err);
  }
}


export async function sendReminderEmail(task) {
  const mailOptions = {
    from: ' "nikhil "<nikkuahirwar2@gmail.com>',
    to: task.emial, // fetch from user table if needed
    subject: `Reminder: ${task.title}`,
    text: `Hey! This is a reminder for your task: ${task.title} - ${task.description}`,
  };

  try {
    await emailService.sendMail(mailOptions);
    console.log(`Reminder sent for task: ${task.title}`);
  } catch (err) {
    console.error('Failed to send reminder:', err);
  }
}


export default emailService;
