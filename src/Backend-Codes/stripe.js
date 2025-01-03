// backend/stripe.js
const express = require('express');
const dotenv = require('dotenv');
const { firestore } = require('../../firebase.js');
const axios = require('axios');
const qs = require('qs');

dotenv.config();

// Initialize express router
const router = express.Router();

function generateTransactionId(userId) {
  // Get current date in YYYYMMDD format
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g., '2025-01-03' becomes '20250103'

  // Generate a random string or number for uniqueness
  const randomPart = Math.floor(Math.random() * 1000000); // Random number between 0 and 999999

  // Combine date, userId, and random number to create a unique transaction ID
  const transactionId = `${dateStr}-${userId}-${randomPart}`;

  return transactionId;
}


// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  const { planId } = req.body;
  const user = req.user;

  const planSnapshot = await firestore.collection("Plans").doc(planId).get();

  if (!planSnapshot.exists) {
    return res.status(400).json({message: 'plan does not exists'});
  }

  const plan = planSnapshot.data();

  const payload = qs.stringify({
    'line_items[0][price]': plan.priceId,
    'line_items[0][quantity]': '1',
    'after_completion[type]': 'redirect',
    'after_completion[redirect][url]': 'https://google.com',
    'metadata[transactionId]': generateTransactionId(user.uid),
  });

  try {
    const response = await axios.post('https://api.stripe.com/v1/payment_links', payload, 
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`  
        }
      }
    );
    if (response.status !== 200) {
      return res.status(500).json({message: 'error processing payment'});
    }

    const {id, url} = response.data;

    const data = {
      paymentId: id,
      paymentUrl: url,
      userId: user.uid,
      createdAt: new Date(),
      status: 'PENDING',
    };

    // save payment record to firestore
    await firestore.collection(`payments/${data.userId}/subcollection`).add(data);

    return res.status(200).json({url});
  } catch(err) {
    console.log(err.message);
  }
   
  }
);

module.exports = router;
