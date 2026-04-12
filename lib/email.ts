import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendChatNotification(toEmail: string, senderName: string) {
  if (!process.env.SMTP_USER) {
    console.warn(`[Mock Email] SMTP_USER missing. Would have sent notification to: ${toEmail}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ParentSchedule Updates" <info@parentschedule.com>',
      to: toEmail,
      subject: 'New Co-Parenting Message Received',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">New Custom Schedule Message</h2>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #374151;">Hello,</p>
            <p style="font-size: 16px; color: #374151;">
              You have received a new secure and legally-recorded message on ParentSchedule from <strong>${senderName}</strong>.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/chat" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Click Here to View & Reply
              </a>
            </div>
            <p style="font-size: 14px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
              For your legal protection, you must log into the application to view the encrypted contents of this message. 
            </p>
          </div>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error("Error executing nodemailer logic", err);
  }
}

export async function sendInvitationEmail(toEmail: string, inviterName: string) {
  if (!process.env.SMTP_USER) {
    console.warn(`[Mock Email] SMTP_USER missing. Would have sent INVITATION to: ${toEmail}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ParentSchedule Updates" <info@parentschedule.com>',
      to: toEmail,
      subject: 'You have been invited to a Co-Parenting Schedule',
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Co-Parenting Invitation</h2>
          </div>
          <div style="padding: 30px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #374151;">Hello,</p>
            <p style="font-size: 16px; color: #374151;">
              <strong>${inviterName}</strong> has invited you to access a shared Co-Parenting Schedule on ParentSchedule.
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Click Here to Accept Invitation
              </a>
            </div>
            <p style="font-size: 14px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
              Please log in with this exact email address to automatically link the schedule to your dashboard.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Invitation sent: %s", info.messageId);
  } catch (err) {
    console.error("Error executing nodemailer logic", err);
  }
}

