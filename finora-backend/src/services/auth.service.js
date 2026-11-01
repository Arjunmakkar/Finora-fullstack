const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('An account with this email already exists', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      accounts: {
        create: { name: 'Primary Bank', type: 'BANK', balance: 0 },
      },
    },
  });

  return { user, token: signToken(user.id) };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid email or password', 401);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  return { user, token: signToken(user.id) };
}

async function loginOrCreateGoogleUser(googleToken) {
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    throw new AppError('Invalid Google credential: ' + err.message, 400);
  }

  const { email, name } = payload;
  if (!email) throw new AppError('Google account does not provide an email', 400);

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);
    user = await prisma.user.create({
      data: {
        name: name || 'Google User',
        email,
        passwordHash,
        accounts: {
          create: { name: 'Primary Bank', type: 'BANK', balance: 0 },
        },
      },
    });
  }

  return { user, token: signToken(user.id) };
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, currency: user.currency };
}

module.exports = { register, login, loginOrCreateGoogleUser, publicUser };
