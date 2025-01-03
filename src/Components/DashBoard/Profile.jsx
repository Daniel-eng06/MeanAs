import React, { useState, useEffect } from "react";
import { auth, signOut } from "../../firebase";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Footer from "../Home/Footer";
import Navbar from "../Home/Navbar.jsx";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();


  //Confirm the firebase rule for this
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setName(currentUser.displayName);
      setEmail(currentUser.email);
    } else {
      const shouldNavigateToFreeAuth = true; 
      if (shouldNavigateToFreeAuth) {
        navigate("/authentication");
      } else {
        navigate("/authentication");
      }
    }
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (user) {
        await updateProfile(user, { displayName: name });
        setSuccess("Profile updated successfully.");
      }
    } catch (error) {
      setError("Error updating profile: " + error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (user && currentPassword) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setSuccess("Password updated successfully.");
      } else {
        setError("Current password is required.");
      }
    } catch (error) {
      setError("Error updating password: " + error.message);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log("User signed out");
      const shouldNavigateToFreeAuth = true; 
      if (shouldNavigateToFreeAuth) {
        navigate("/authentication");
      } else {
        navigate("/authentication");
      }
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const vid ={
    vid1:"Gradient 2.mp4"
  };

  return (
    <div className="profi">
        <video id="background-video"
                   src={vid.vid1}       
                   alt = "background video"
                   loop 
                   autoPlay 
                   muted 
                   playsInline
           >
        </video>
        <Navbar/>
        <div className="profile">
        <h1>Profile</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
        {user && (
            <div>
            <form onSubmit={handleProfileUpdate} className="profile-form">
                <label>Name:</label>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                />
                <button type="submit" id='proflog'>Update Profile</button>
            </form>
            <form onSubmit={handlePasswordChange} className="password-form">
                <label>Current Password:</label>
                <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                required
                />
                <label>New Password:</label>
                <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                required
                />
                <button type="submit" id='proflog'>Change Password</button>
            </form>
            <button onClick={handleLogout} id='proflog'>Logout</button>
            </div>
        )}
        </div>
        <Footer/>
    </div>
  );
};

export default Profile;
