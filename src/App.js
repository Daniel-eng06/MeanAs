import React, { useState, useEffect, createContext } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import "./App.css";
import Home from "./Main.jsx";
import Dashboard from "./Components/DashBoard/Dashboard";
import Preprocess from './Components/DashBoard/Pre-process.jsx';
import Errorchecker from './Components/DashBoard/Errorchecker.jsx';
import Postprocess from './Components/DashBoard/Post-Process.jsx';
import Authentication from './Components/Home/Authentication.jsx';
import Pricing from './Components/Home/Pricing.jsx';
import About from './Components/Home/About.jsx';
import Features from "./Components/Home/Features.jsx";
import Profile from "./Components/DashBoard/Profile.jsx";
import Projects from './Components/DashBoard/Projects.jsx';
import TeamConnect from './Components/DashBoard/TeamConnect.jsx';
import HelpCenter from './Components/Home/HelpCenter.jsx';
import PaymentFlow from './Components/Home/StripePayment.jsx';
import Success from './Components/Home/Success.jsx'; 
import ProtectedRoute from "./Protectroute.jsx";

export const AuthContext = createContext();


function MeanAsApp() {
  const [user, setUser] = useState(null);

  // Listen for authentication state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Logout
  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => setUser(null))
      .catch((error) => console.error("Error during sign-out:", error.message));
  };

  return (
    <AuthContext.Provider value={{ user, handleLogout }}>
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/helpcenter" element={<HelpCenter />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/authentication" element={<Authentication />} />
            <Route path="/paymentflow/:id" element={<PaymentFlow />} caseSensitive={false} />
            <Route path="/success" element={<Success />} />
            {user && (
              <>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/preprocess" element={<ProtectedRoute><Preprocess /></ProtectedRoute>} />
                <Route path="/errorchecker" element={<ProtectedRoute><Errorchecker /></ProtectedRoute>} />
                <Route path="/postprocess" element={<ProtectedRoute><Postprocess /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/teamconnect" element={<ProtectedRoute><TeamConnect /></ProtectedRoute>} />
              </>
            )}
          </Routes>
        </Router>
      </div>
    </AuthContext.Provider>
  );
}

export default MeanAsApp;
