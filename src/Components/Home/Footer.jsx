import React from "react";
import "./Footer.css";
import {Link} from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <nav className="footer-nav">
          <Link to="/about">About</Link>
          <Link to="/features">Features</Link>
          <Link to="/authentication">Dashboard</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/helpcenter">MeanAs Help Center</Link>
        </nav>
        <p></p>
        <p>&copy; 2025 meanasai.com. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
