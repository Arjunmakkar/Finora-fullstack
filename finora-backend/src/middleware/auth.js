const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
  let token = req.cookies && req.cookies.finora_session;
  if (!token) {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      token = header.slice(7);
    }
  }

  if (!token) {
    return next(new AppError('Not authenticated', 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = requireAuth;
