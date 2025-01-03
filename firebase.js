const admin = require('firebase-admin');
const dotenv = require('dotenv');
const serviceAccountKey = require('./serviceAccountKey.json');
  
dotenv.config();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    databaseURL: process.env.REACT_APP_DATABASE_URL,
});


const firestore = admin.firestore()
const storage = admin.storage().bucket();

module.exports = {firestore, storage}
  