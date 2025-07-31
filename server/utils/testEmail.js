require('dotenv').config();
const sendEmail = require('./sendEmail');

sendEmail({
  to: 'telfahmohammed16@gmail.com',  // ← تأكد أنه نفس الإيميل اللي بتفتحه
  subject: 'Test Email from TalafhaStore',
  html: '<h2>This is a test email</h2><p>If you see this, the mail works.</p>'
})
.then(() => console.log('✅ Email sent successfully'))
.catch((err) => console.error('❌ Error sending email:', err));
