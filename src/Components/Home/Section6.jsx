// FeedbackForm.js
import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import "./Section6.css";

function FeedbackForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");



/* Check how this integrates with the firebase rules confirm the right rule for the permission */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "feedbacks"), {
        email: email,
        feedback: feedback,
      });

      setMessage("Feedback submitted successfully!");
      setEmail("");
      setFeedback("");
    } catch (error) {
      setMessage("Error submitting feedback: " + error.message);
    }
  };

  const arrow = {
    arr: "arrow.png",
  };

  return (
    <div className="feedback-form-container">
      <h1 className="comment">
        More Feedback, Better <span>MeanAs</span> <br /> For Your Specific FEA/CFD Projects
      </h1>
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="feedback-left">
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="How can we continue to make this product the best for you? And also share your testimonials here. Please comment..."
            required
          />
        </div>
        <div className="left">
          <div><img src={arrow.arr} alt=""/></div>
        </div>
        <div className="feedback-right">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
          <button type="submit">Submit Your Feedback</button>
        </div>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default FeedbackForm;
