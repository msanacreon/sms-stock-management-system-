const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const [users] = await pool.query(
      'SELECT userId, username, password FROM UserAccount WHERE username = ?',
      [username]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const storedPassword = users[0].password;
    const isHashed = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$');
    const isValid = isHashed
      ? await bcrypt.compare(password, storedPassword)
      : password === storedPassword;
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { userId: users[0].userId, username: users[0].username },
      process.env.JWT_SECRET || 'stockhub_sms_secret',
      { expiresIn: '8h' }
    );

    return res.json({ token, username: users[0].username });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
