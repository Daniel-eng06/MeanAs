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
const { verifyToken } = require('./src/Backend-Codes/util')


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


app.use('/preprocess', verifyToken, preprocessRouter);
app.use('/postprocess',verifyToken, postprocessRouter);
app.use('/errorchecker', verifyToken, errorcheckerRouter);
app.use('/stripe', stripeRouter);

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
});