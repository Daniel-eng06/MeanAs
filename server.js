const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const stripeRouter = require('./src/Backend-Codes/stripe');
const preprocessRouter = require('./src/Backend-Codes/preprocess');
const postprocessRouter = require('./src/Backend-Codes/postprocess');
const errorcheckerRouter = require('./src/Backend-Codes/errorchecker');


const app = express();
const PORT = process.env.BACKEND_PORT || 5001;

// At the top of your server file
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
  }
});



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

app.use('/preprocess', verifyToken, preprocessRouter);
app.use('/postprocess',verifyToken, postprocessRouter); 
app.use('/errorchecker', verifyToken, errorcheckerRouter); 
app.use('/stripe', verifyToken, stripeRouter);

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Full URL: http://localhost:${PORT}/preprocess`);
  console.log(`Full URL: http://localhost:${PORT}/errorchecker`);
  console.log(`Full URL: http://localhost:${PORT}/postprocess`);
  console.log(`Full URL: http://localhost:${PORT}/stripe`);
});