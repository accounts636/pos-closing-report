const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');

const { connect } = require('./db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const entryRoutes = require('./routes/entries');
const pdfRoutes = require('./routes/pdf');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'pos-closing-report-change-this-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 12 } // 12 hours
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/pdf', pdfRoutes);

app.get('/', (req, res) => res.redirect('/login.html'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/healthz', (req, res) => res.json({ ok: true }));

async function ensureDefaultAdmin() {
  const db = await connect();
  const count = await db.collection('users').countDocuments();
  if (count > 0) return;

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const name = process.env.ADMIN_NAME || 'Administrator';

  await db.collection('users').insertOne({
    username,
    password_hash: bcrypt.hashSync(password, 10),
    name,
    role: 'admin',
    created_at: new Date().toISOString()
  });

  console.log('============================================');
  console.log('No users found — created a default admin account:');
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
  console.log('Log in and change this password, or create new users from the Admin panel.');
  console.log('============================================');
}

async function start() {
  try {
    await connect();
    await ensureDefaultAdmin();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`POS Closing Report running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
