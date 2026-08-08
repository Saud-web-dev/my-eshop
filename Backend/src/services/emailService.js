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

// Create transporter with robust Gmail SMTP configuration
const createTransporter = () => {
  const user = process.env.EMAIL_USER?.trim();
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    console.warn('Email credentials not configured (EMAIL_USER or EMAIL_PASS missing).');
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email with better error handling
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('Email not sent - transporter not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const storeName = await getStoreName();
    const mailOptions = {
      from: `"${storeName}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text,
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
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; }
        .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #e94560 100%); padding: 24px; text-align: center; color: #fff; }
        .body { padding: 28px; }
        .field { margin-bottom: 16px; }
        .label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .value { font-size: 15px; color: #1a1a2e; background: #f8f8f8; border-radius: 8px; padding: 10px 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Contact Message</h1>
          <p>${storeName || 'Your Store'}</p>
        </div>
        <div class="body">
          <div class="field">
            <div class="label">From</div>
            <div class="value">${name} &lt;${email}&gt;</div>
          </div>
          <div class="field">
            <div class="label">Subject</div>
            <div class="value">${subject || '(No subject)'}</div>
          </div>
          <div class="field">
            <div class="label">Message</div>
            <div class="value" style="white-space:pre-line">${message}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `New contact message from ${name} (${email})\nSubject: ${subject}\n\n${message}`;

  return sendEmail({ to: to || process.env.CONTACT_EMAIL || process.env.EMAIL_USER, subject: `New Contact Message: ${subject || 'From website'}`, html, text });
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