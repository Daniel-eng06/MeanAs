import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth } from '../../firebase';
import './StripePayment.css';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import axios from 'axios';
import { Link } from "react-router-dom";

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
          const temp = {...querySnapshot.data(), id: querySnapshot.id};
          setPlan(temp);
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
    console.log(plan);
    if (!user) {
      navigate(`/authentication${plan.price === 0 ? '?q=free' : `?q=${plan.id}`}`);
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
      alert(err?.response?.data?.message || "Unexpected error occurred. Please try again later")
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div id='loadpay'>Loading...</div>;
  }

  if (!plan) {
    return <div id='loadpay'>No plan found.</div>;
  }


  return (
    <div className='payflow'>
      <div className="payment-flow">
        <h2>Subscribe to {plan.name}</h2>
        <p><strong>Price:</strong> ${plan.price} per {plan.duration}</p>
        <p>Thank you for choosing MeanAs as your personal FEA/CFD analysis assistant tool.</p>
         <div className='choice'>
            <button onClick={handleSubscribe} disabled={loading}>
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            <button >
              <Link to = "/" className= "homepage"> 
                Back Home 
              </Link>
            </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFlow;
