const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const { ConvexHttpClient } = require('convex/browser');

const client = new ConvexHttpClient(process.env.CONVEX_URL);

async function getAdminUser() {
  let adminUser = await client.query('users:getAdmin');
  if (!adminUser) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('admin123', salt);
    await client.mutation('users:initAdmin', {
      username: 'admin',
      passwordHash: hashedPassword,
    });
    adminUser = await client.query('users:getAdmin');
  }
  return adminUser;
}

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    const adminUser = await getAdminUser();
    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (username !== adminUser.username || !isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ success: true, token, user: { username, role: 'admin' }, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

router.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
});

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

router.put('/update', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body;
    if (!currentPassword || !newUsername || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const adminUser = await getAdminUser();
    const isMatch = await bcrypt.compare(currentPassword, adminUser.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current password.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await client.mutation('users:updateAdmin', { username: newUsername, passwordHash: hashedPassword });
    res.json({ success: true, message: 'Credentials updated successfully' });
  } catch (error) {
    console.error('Update credentials error:', error);
    res.status(500).json({ message: 'Server error updating credentials.' });
  }
});

module.exports = router;
