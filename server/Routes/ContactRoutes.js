const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { createContactMessage, listMessages } = require('../Controllers/contactusController');

const validate = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is too short'),
  body('email').isEmail().withMessage('Invalid email'),
  body('subject').trim().isLength({ min: 3 }).withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message is too short'),
];

// small middleware to return validator errors as JSON
router.use((req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({ ok: false, errors: result.array() });
  next();
});

router.post('/create', validate, createContactMessage);
router.get('/list', listMessages);

module.exports = router;
