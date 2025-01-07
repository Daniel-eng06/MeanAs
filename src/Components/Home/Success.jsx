import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import axios from 'axios';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const transactionId = searchParams.get('transaction_id');
  const userId = searchParams.get('user_id');

  useEffect(() => {
    if (!transactionId) {
      navigate('/pricing');
      return;
    }

    const verifySubscription = async () => {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      try {
        
        const response = await axios({
          method: 'GET',
          url: `${apiUrl}/stripe/transaction?transaction_id=${transactionId}&user_id=${userId}`,
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 300000,
        });

        const responseData = response.data;

        if (response.status !== 200) {
          setStatus('error');
        } else {
          setStatus(responseData.payment_status === 'paid' ? 'success' : 'error');
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setStatus('Error verifying transaction');
      }
    };

    verifySubscription();
  }, [transactionId, userId, navigate]);

  return (
    <div className="success-page">
      {loading && (
        <div id='loadpay'>Loading...</div>
      )}
      
      {status === 'success' && (
        <div className="success-state">
          <h1>Thank you for subscribing!</h1>
          <p>Your subscription is now active.</p>
          <div className="action-buttons">
            <button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="error-state">
          <h1>Something went wrong</h1>
          <p>We couldn't verify your subscription.</p>
          <div className="action-buttons">
            <button onClick={() => navigate('/support')}>
              Contact Support
            </button>
            <button onClick={() => navigate('/pricing')}>
              Return to Pricing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Success;