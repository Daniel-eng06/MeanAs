import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      navigate('/pricing');
      return;
    }

    const verifySubscription = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/authentication');
          return;
        }

        const idToken = await user.getIdToken();
        const response = await fetch('/api/stripe/subscription-status', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        const data = await response.json();
        
        if (data.status === 'active') {
          setStatus('success');
          localStorage.setItem('subscriptionStatus', 'active');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Error verifying subscription:', error);
        setStatus('error');
      }
    };

    verifySubscription();
  }, [sessionId, navigate]);

  return (
    <div className="success-page">
      {status === 'loading' && (
        <div className="loading-state">
          <h2>Processing your subscription...</h2>
        </div>
      )}
      
      {status === 'success' && (
        <div className="success-state">
          <h1>Thank you for subscribing!</h1>
          <p>Your subscription is now active.</p>
          <div className="action-buttons">
            <button onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </button>
            <button onClick={() => navigate('/profile')}>
              View Subscription Details
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