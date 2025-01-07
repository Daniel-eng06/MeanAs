const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
    try {
      const idToken = req.headers.authorization?.split('Bearer ')[1];
      if (!idToken) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({ message: 'Unauthorized' });
    }
  };

module.exports = {
    verifyToken,
}