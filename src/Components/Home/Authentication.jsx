import React, { useState, useEffect } from "react";
import { auth, db, analytics, googleProvider } from '../../firebase';
import { signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import "./Authentication.css";
import { logEvent } from "firebase/analytics";

const Authentication = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan || "Explorer Plan";
  const [queryParams] = useSearchParams();

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      if (user) {
        console.log('User authenticated:', user.name);
        
        // Set or update user details in Firestore, including subscription status
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          signupDate: serverTimestamp()
        }, { merge: true });
      }
  
      // Firebase Storage authentication check (optional)
      if (auth.currentUser) {
        console.log('User authenticated for Firebase Storage');
      } else {
        console.error('User is not authenticated for Firebase Storage');
        setError("User is not authenticated. Please sign in again.");
      }

      const planType = queryParams.get("q");

      if (planType === 'free') {
        console.log('running')
        await addDoc(collection(db, "tmpSubscriptions"), {
          plan: 'free',
          userId: user.uid
        });

        navigate("/dashboard", { state: { plan } });
      } else {
        navigate(`/paymentflow/${planType}`, { state: { plan } });
      }
  
    } catch (error) {
      console.error("Error during sign-in:", error);
      setError("Failed to sign in. Please try again.");
    }
  };
  

  // Error handler function
  const handleError = (error) => {
    switch (error.code) {
      case "auth/popup-closed-by-user":
        setError("Sign-in popup was closed before completing the sign-in.");
        break;
      case "auth/popup-blocked":
        setError("Sign-in popup was blocked. Please allow popups and try again.");
        break;
      default:
        setError("An unexpected error occurred. Please try again later.");
    }
  };

  // Redirect if user is already signed in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Conditional redirection based on plan
        if (plan === "Explorer Plan") {
          navigate("/dashboard", { state: { plan } });
        } else {
          navigate("/paymentflow", { state: { plan } });
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, plan]);

  // Image and video assets
  const image = {
    MeanAsLogo: "NobgLogo.png",
    vid1: "Gradient 2.mp4",
  };

  // Log event for link click
  const handleLinkClick = (linkAuth) => {
    logEvent(analytics, 'link_click', { link_auth: linkAuth });
  };

  return (
    <div className="auth">
      <video id="background-video" src={image.vid1}       
              alt = "background video"
              loop 
              autoPlay 
              muted 
              playsInline
      />
      <Link className="meanaslogo" to="/">
        <img src={image.MeanAsLogo} alt="MeanAs Logo" />
      </Link>
      <div className="welcome-message">
        <h2>Welcome to MeanAs!</h2>
        <p>We are thrilled to have you here. To get started, please sign in with your Google account.</p>
        <p>It is quick, secure, and ensures a seamless experience as you explore our platform. Thank you for choosing MeanAs!</p>
      </div>
      {error && <p style={{ color: "red" }}>{handleError(error)}</p>}
      <button className="google-signin" onClick={() => {
        handleLinkClick("Signin with Google");
        handleGoogleSignIn();
      }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Authentication;
