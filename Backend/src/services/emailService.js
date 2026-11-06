// import nodemailer from 'nodemailer';

// const createTransporter = () => {
//   return nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
// };

// const sendEmail = async ({ to, subject, html, text }) => {
//   const transporter = createTransporter();
//   const mailOptions = {
//     from: `"${process.env.EMAIL_FROM_NAME || 'Your Store'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//     text,
//   };
//   return transporter.sendMail(mailOptions);
// };

// // OTP Email
// export const sendOTPEmail = async (email, otp, purpose = 'email-verification') => {
//   const titles = {
//     'email-verification': 'Verify Your Email',
//     'password-reset': 'Reset Your Password',
//     'login': 'Your Login OTP',
//   };

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8" />
//       <style>
//         body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
//         .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
//         .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 32px; text-align: center; }
//         .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px; }
//         .body { padding: 32px; }
//         .otp-box { background: #f8f8f8; border: 2px dashed #e94560; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
//         .otp { font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #1a1a2e; }
//         .expiry { color: #888; font-size: 13px; margin-top: 8px; }
//         .footer { background: #f5f5f5; padding: 16px; text-align: center; color: #aaa; font-size: 12px; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Your Store</h1>
//         </div>
//         <div class="body">
//           <h2 style="color:#1a1a2e">${titles[purpose] || 'Your OTP'}</h2>
//           <p style="color:#555">Use the following One-Time Password to proceed. This OTP expires in <strong>5 minutes</strong>.</p>
//           <div class="otp-box">
//             <div class="otp">${otp}</div>
//             <div class="expiry">â± Expires in 5 minutes</div>
//           </div>
//           <p style="color:#888;font-size:13px">If you did not request this, please ignore this email and ensure your account is secure.</p>
//         </div>
//         <div class="footer">
//           &copy; ${new Date().getFullYear()} Your Store. All rights reserved.
//         </div>
//       </div>
//     </body>
//     </html>
//   `;

//   return sendEmail({ to: email, subject: titles[purpose], html });
// };

// // Welcome Email
// export const sendWelcomeEmail = async (email, name) => {
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
//         .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
//         .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 32px; text-align: center; }
//         .header h1 { color: #fff; margin: 0; }
//         .body { padding: 32px; }
//         .btn { display: inline-block; background: #e94560; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header"><h1>Welcome to Your Store</h1></div>
//         <div class="body">
//           <h2>Hello ${name}! ðŸ‘‹</h2>
//           <p>Your account has been successfully created. Explore our premium fragrance collection.</p>
//           <p style="text-align:center;margin-top:24px">
//             <a href="${process.env.CLIENT_URL}/shop" class="btn">Shop Now</a>
//           </p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
//   return sendEmail({ to: email, subject: 'Welcome to Your Store!', html });
// };

// // Order Confirmation Email
// export const sendOrderConfirmationEmail = async (email, name, order) => {
//   const itemsHtml = order.items
//     .map(
//       (item) => `
//       <tr>
//         <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
//         <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
//         <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">â‚¨${item.price.toLocaleString()}</td>
//       </tr>`
//     )
//     .join('');

//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
//         .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
//         .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 24px; text-align: center; color: #fff; }
//         .body { padding: 24px; }
//         table { width: 100%; border-collapse: collapse; }
//         th { background: #f5f5f5; padding: 10px; text-align: left; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header">
//           <h1>Order Confirmed! ðŸŽ‰</h1>
//           <p>Order #${order.orderNumber}</p>
//         </div>
//         <div class="body">
//           <h3>Hello ${name},</h3>
//           <p>Your order has been placed successfully.</p>
//           <table>
//             <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
//             <tbody>${itemsHtml}</tbody>
//           </table>
//           <p style="margin-top:16px"><strong>Total: â‚¨${order.total.toLocaleString()}</strong></p>
//           <p>We will notify you when your order is shipped.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
//   return sendEmail({ to: email, subject: `Order Confirmed - #${order.orderNumber}`, html });
// };

// // Password Reset Email
// export const sendPasswordResetEmail = async (email, resetToken) => {
//   const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
//   const html = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <style>
//         body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
//         .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
//         .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 24px; text-align: center; color: #fff; }
//         .body { padding: 24px; }
//         .btn { display: inline-block; background: #e94560; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; }
//       </style>
//     </head>
//     <body>
//       <div class="container">
//         <div class="header"><h1>Password Reset</h1></div>
//         <div class="body">
//           <p>You requested a password reset. Click the button below within <strong>1 hour</strong>:</p>
//           <p style="text-align:center;margin:24px 0">
//             <a href="${resetUrl}" class="btn">Reset Password</a>
//           </p>
//           <p style="font-size:12px;color:#888">If you did not request this, ignore this email. Link expires in 1 hour.</p>
//         </div>
//       </div>
//     </body>
//     </html>
//   `;
//   return sendEmail({ to: email, subject: 'Password Reset - Your Store', html });
// };

// export default sendEmail;

import nodemailer from 'nodemailer';
import Settings from '../models/Settings.js';

// Helper to get store name dynamically
const getStoreName = async () => {
  try {
    const settings = await Settings.findOne().select('storeName');
    return settings?.storeName || process.env.EMAIL_FROM_NAME || 'Your Store';
  } catch {
    return process.env.EMAIL_FROM_NAME || 'Your Store';
  }
};

// Create a Gmail SMTP transporter using a Google App Password.
const createTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    console.warn('Email credentials are not configured. Set EMAIL_USER and EMAIL_PASS to a Gmail address and App Password.');
    return null;
  }

  if (/^(change|replace|your_|example|dummy|placeholder|dev-|demo)/i.test(pass)) {
    console.warn('EMAIL_PASS is still a placeholder. Set it to a valid Google App Password.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

// Send email with better error handling
const sendEmail = async ({ to, subject, html, text, replyTo }) => {
  const transporter = createTransporter();

  if (!transporter) {
    throw new Error('Email service is not configured. Set EMAIL_USER and a valid Gmail App Password in Backend/.env.');
  }

  try {
    const storeName = await getStoreName();
    const mailOptions = {
      from: `"${storeName}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// OTP Email
export const sendOTPEmail = async (
  email,
  otp,
  purpose = 'email-verification'
) => {
  const titles = {
    'email-verification': 'Verify Your Email',
    'password-reset': 'Reset Your Password',
    login: 'Your Login OTP',
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px; }
        .body { padding: 32px; }
        .otp-box { background: #f8f8f8; border: 2px dashed #e94560; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp { font-size: 42px; font-weight: 700; letter-spacing: 12px; color: #1a1a2e; }
        .expiry { color: #888; font-size: 13px; margin-top: 8px; }
        .footer { background: #f5f5f5; padding: 16px; text-align: center; color: #aaa; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Store</h1>
        </div>
        <div class="body">
          <h2 style="color:#1a1a2e">${titles[purpose] || 'Your OTP'}</h2>
          <p style="color:#555">Use the following One-Time Password to proceed. This OTP expires in <strong>5 minutes</strong>.</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="expiry">â± Expires in 5 minutes</div>
          </div>
          <p style="color:#888;font-size:13px">If you did not request this, please ignore this email and ensure your account is secure.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Your Store. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const result = await sendEmail({ to: email, subject: titles[purpose], html });
  if (!result.success) {
    throw new Error(result.error);
  }
  return result;
};

// Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; }
        .body { padding: 32px; }
        .btn { display: inline-block; background: #e94560; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Welcome to Your Store</h1></div>
        <div class="body">
          <h2>Hello ${name}! ðŸ‘‹</h2>
          <p>Your account has been successfully created. Explore our premium fragrance collection.</p>
          <p style="text-align:center;margin-top:24px">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/shop" class="btn">Shop Now</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  const result = await sendEmail({
    to: email,
    subject: 'Welcome to Your Store!',
    html,
  });
  return result;
};

// Order Confirmation Email
export const sendOrderConfirmationEmail = async (email, name, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">â‚¨${item.price.toLocaleString()}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 24px; text-align: center; color: #fff; }
        .body { padding: 24px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f5; padding: 10px; text-align: left; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed! ðŸŽ‰</h1>
          <p>Order #${order.orderNumber}</p>
        </div>
        <div class="body">
          <h3>Hello ${name},</h3>
          <p>Your order has been placed successfully.</p>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p style="margin-top:16px"><strong>Total: â‚¨${order.total.toLocaleString()}</strong></p>
          <p>We will notify you when your order is shipped.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({
    to: email,
    subject: `Order Confirmed - #${order.orderNumber}`,
    html,
  });
};

// Contact Form Email (store receives the customer's message)
export const sendContactEmail = async ({ name, email, subject, message, storeName, to }) => {
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
  const recipient = to || process.env.CONTACT_EMAIL || process.env.EMAIL_USER;
  const safeSubject = String(subject || 'From website').replace(/[\r\n]+/g, ' ').trim();

  if (!recipient) {
    return { success: false, error: 'No contact email recipient is configured.' };
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New message for ${escapeHtml(storeName || 'Your Store')}</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f5f1e9;font-family:Arial,Helvetica,sans-serif;color:#171717;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f1e9;">
          <tr>
            <td align="center" style="padding:36px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background-color:#fffdf9;">
                <tr>
                  <td style="padding:28px 36px 18px;border-bottom:1px solid #d8d0c1;">
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:17px;font-weight:bold;letter-spacing:0.4px;color:#171717;">
                      ${escapeHtml(storeName || 'Your Store')}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:34px 36px 28px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#98752c;">
                      A note from your customer
                    </p>
                    <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.15;font-weight:normal;color:#171717;">
                      New contact<br />message
                    </h1>
                    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#625c52;">
                      Someone has reached out through your website. Their message is below.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 36px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #d8d0c1;border-bottom:1px solid #d8d0c1;">
                      <tr>
                        <td width="50%" valign="top" style="padding:18px 12px 18px 0;">
                          <p style="margin:0 0 7px;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#98752c;">From</p>
                          <p style="margin:0;font-size:14px;line-height:1.6;color:#171717;">${escapeHtml(name)}</p>
                          <p style="margin:2px 0 0;font-size:13px;line-height:1.6;word-break:break-word;">
                            <a href="mailto:${escapeHtml(email)}" style="color:#625c52;text-decoration:underline;">${escapeHtml(email)}</a>
                          </p>
                        </td>
                        <td width="50%" valign="top" style="padding:18px 0 18px 12px;">
                          <p style="margin:0 0 7px;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#98752c;">Subject</p>
                          <p style="margin:0;font-size:14px;line-height:1.6;color:#171717;word-break:break-word;">${escapeHtml(safeSubject || '(No subject)')}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 36px 30px;">
                    <p style="margin:0 0 12px;font-size:10px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#98752c;">Their message</p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.75;color:#29251f;white-space:pre-wrap;overflow-wrap:anywhere;">${escapeHtml(message)}</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                      <tr>
                        <td bgcolor="#171717" style="border-radius:3px;">
                          <a href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${safeSubject}`)}" style="display:inline-block;padding:13px 22px;font-size:13px;font-weight:bold;color:#ffffff;text-decoration:none;">
                            Reply to ${escapeHtml(name)}
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 36px;border-top:1px solid #d8d0c1;">
                    <p style="margin:0;font-size:11px;line-height:1.6;color:#8a8378;">
                      Sent from the contact form on ${escapeHtml(storeName || 'Your Store')}.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `A NOTE FROM YOUR CUSTOMER\n${storeName || 'Your Store'}\n\nNew contact message\n\nFROM\n${name} <${email}>\n\nSUBJECT\n${safeSubject}\n\nTHEIR MESSAGE\n${message}\n\nReply directly to this email to contact ${name}.`;

  return sendEmail({
    to: recipient,
    replyTo: email,
    subject: `New Contact Message: ${safeSubject}`,
    html,
    text,
  });
};

// Password Reset Email
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
        .container { max-width: 500px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 24px; text-align: center; color: #fff; }
        .body { padding: 24px; }
        .btn { display: inline-block; background: #e94560; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Password Reset</h1></div>
        <div class="body">
          <p>You requested a password reset. Click the button below within <strong>1 hour</strong>:</p>
          <p style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </p>
          <p style="font-size:12px;color:#888">If you did not request this, ignore this email. Link expires in 1 hour.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({
    to: email,
    subject: 'Password Reset - Your Store',
    html,
  });
};

export default sendEmail;