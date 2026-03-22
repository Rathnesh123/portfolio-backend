const express = require('express');
const verifyToken = require('../middleware/auth');
const { loadData, saveData } = require('../db');
const nodemailer = require('nodemailer');
const router = express.Router();

const FILE = 'contact.json';
const DEFAULTS = {
  _id: '1',
  email: 'rathnesh.bunty@gmail.com',
  phone: '',
  location: 'India',
  linkedin: 'https://linkedin.com/in/rathnesh06',
  github: 'https://github.com/Rathnesh123',
  twitter: '',
  website: '',
  bio: 'Open to new opportunities and collaborations. Feel free to reach out!',
};

let contactInfo = loadData(FILE, DEFAULTS);

// GET /api/contact
router.get('/', (req, res) => {
  res.json({ success: true, data: contactInfo });
});

// PUT /api/contact (protected)
router.put('/', verifyToken, (req, res) => {
  contactInfo = { ...contactInfo, ...req.body };
  saveData(FILE, contactInfo);
  res.json({ success: true, data: contactInfo });
});

// POST /api/contact/message (public) — sends real email
router.post('/message', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email, and message are required' });
  }

  const GMAIL_USER = process.env.GMAIL_USER;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
  const RECIPIENT_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL || GMAIL_USER;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error('Email credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    console.log('Contact message (email not sent):', { name, email, message });
    return res.json({ success: true, message: 'Message received! I will get back to you soon.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${GMAIL_USER}>`,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: `📬 New message from ${name} via Portfolio`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f1a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #4f46e5, #8b5cf6); padding: 28px 32px;">
            <h1 style="margin: 0; font-size: 22px; color: #fff;">📬 New Portfolio Message</h1>
            <p style="margin: 6px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">You received a message via your portfolio contact form</p>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8b5cf6; width: 80px;">From</td>
                <td style="padding: 10px 0; font-size: 15px; color: #fff; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8b5cf6;">Email</td>
                <td style="padding: 10px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #a78bfa;">${email}</a></td>
              </tr>
            </table>
            <div style="margin-top: 24px; padding: 20px; background: rgba(255,255,255,0.04); border-left: 3px solid #8b5cf6; border-radius: 6px;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8b5cf6; margin-bottom: 10px;">Message</p>
              <p style="margin: 0; font-size: 15px; line-height: 1.7; color: #e2e8f0; white-space: pre-wrap;">${message}</p>
            </div>
            <p style="margin-top: 28px; font-size: 12px; color: #555; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px;">
              Hit "Reply" in your email client to respond directly to ${name}.
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Contact email sent from ${email} (${name})`);
    res.json({ success: true, message: 'Message sent! I will get back to you soon.' });
  } catch (err) {
    console.error('Failed to send contact email:', err.message);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
