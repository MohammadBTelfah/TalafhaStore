const nodemailer = require('nodemailer');
const ContactMessage = require('../models/Contactus');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, phone = '', subject, message } = req.body;

    if (!name || name.trim().length < 2)   return res.status(400).json({ ok: false, error: 'Name is too short.' });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ ok: false, error: 'Invalid email.' });
    if (!subject || subject.trim().length < 3)   return res.status(400).json({ ok: false, error: 'Subject is required.' });
    if (!message || message.trim().length < 10)  return res.status(400).json({ ok: false, error: 'Message is too short.' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const doc = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
      ip,
      userAgent,
      source: 'web',
    });

    // Notify you (won’t fail the request if email sending fails)
    transporter.sendMail({
      from: `"Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.MAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New contact — ${subject}`,
      text:
`From: ${name} <${email}> ${phone ? '(' + phone + ')' : ''}
IP: ${ip}
UA: ${userAgent}

${message}`,
    }).catch(e => console.warn('Owner mail failed:', e.message));

    // Optional auto-reply
    if (String(process.env.AUTO_REPLY || 'true').toLowerCase() === 'true') {
      transporter.sendMail({
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'We received your message',
        text:
`Hi ${name},

Thanks for reaching out. We received your message and will get back to you soon.
Subject: ${subject}

Best regards,`
      }).catch(e => console.warn('Auto-reply failed:', e.message));
    }

    return res.json({ ok: true, id: doc._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: 'Internal error.' });
  }
};

exports.listMessages = async (_req, res) => {
  try {
    const items = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
    res.json({ ok: true, items });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Fetch failed.' });
  }
};
