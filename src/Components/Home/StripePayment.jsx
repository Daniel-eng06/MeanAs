import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../firebase';
import Footer from '../Home/Footer';
import Navbar from '../Home/Navbar';
import './StripePayment.css';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import axios from 'axios';

const PaymentFlow = () => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const querySnapshot = await getDoc(doc(db, "Plans", id));
        setLoading(false);
        if (querySnapshot.exists()) {
          setPlan(querySnapshot.data());
        } else {
          navigate("/pricing");
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [id, navigate]);

  const handleSubscribe = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/authentication');
      return;
    }

    const idToken = await user.getIdToken();
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    try {
      setLoading(true);

      const response = await axios({
        method: 'POST',
        url: `${apiUrl}/stripe/create-checkout-session`,
        data: { planId: id },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        timeout: 300000,
      });

      const { url } = response.data;
      window.location.href = url;

    } catch (err) {
      console.log(err.response?.data || "Error occurred during checkout.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div id='loadpay'>Loading...</div>;
  }

  if (!plan) {
    return <div>No plan found.</div>;
  }


  return (
    <div className='payflow'>
      <div className="payment-flow">
        <h2>Subscribe to {plan.name}</h2>
        <p><strong>Price:</strong> ${plan.price} per {plan.duration}</p>
        <p>Thank you for choosing MeanAs as your personal FEA/CFD analysis assistant tool.</p>
        <button onClick={handleSubscribe} disabled={loading}>
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentFlow;
