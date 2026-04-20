const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'patent_secret_key';

const ipLogger = async (req, res, next) => {
  try {
    let userId = null;

    if (req.user && (req.user.userId || req.user.id)) {
      userId = req.user.userId || req.user.id;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId || decoded.id;
      } catch (err) {
        // invalid token, ignore
      }
    }

    if (userId) {
      const clientIp = req.ip || req.connection.remoteAddress;
      if (clientIp) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            lastKnownIPs: {
              $each: [clientIp],
              $slice: -20
            }
          }
        });
      }
    }
  } catch (error) {
    console.error('IP Logger Error:', error);
  } finally {
    next();
  }
};

module.exports = ipLogger;
