import React from 'react';
import Navbar from "../Home/Navbar.jsx";
import Footer from "../Home/Footer";
import "./About.css";
import { Link } from 'react-router-dom';


function About() {
    const vid ={
        vid1:"Gradient 2.mp4"
    }
    return(
        <div className='about'>
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
            <div className="about-section">
                <h1>About MeanAs</h1>
                <p>
                    On March 25th, 2024, I faced a situation that highlighted the critical need for reliable access to analysis resources.
                    As someone passionate about helping others with their model analysis, I had created a detailed video tutorial for a friend's CFD project. However, due to storage limitations, I had to delete the files.
                     A month later, the email expired, and when my friend needed the project guidelines again, they were gone.
                    She also asked for help interpreting the CFD results, which served as a reminder of how essential it is to have ongoing, easy access to accurate FEA and CFD tools and insights.
                </p>
                <p>
                    That experience inspired the creation of MeanAs, an AI-powered platform built to give you the clarity and confidence you need before and after any FEA or CFD project. 
                    With MeanAs, you will never have to worry about losing access to crucial analysis data, and you will always understand the outcomes with crystal-clear interpretations.
                </p>
                <p>
                    Whether you are a small business, researcher, university student, or designer, MeanAs is designed for you, even if you are not a CAE expert. 
                    By leveraging artificial intelligence, MeanAs delivers custom assistance for your projects, from smarter material selection to accurate results interpretation. Here is what you will get:
                </p>
                <ul>
                    <li>Precision and clarity in pre-processing</li>
                    <li>Immediate solutions for FEA and CFD analysis errors</li>
                    <li>Clear and reliable post-processing insights</li>
                </ul>
                <p>
                    With MeanAs, you can confidently test, validate, and understand your models, all while saving time and ensuring accuracy.
                    Are you ready to elevate your projects? <Link to="/Pricing">Click here to try MeanAs for free</Link> and see the difference.
                </p>
                </div>
            <Footer/>
        </div>
    )
};

export default About;
