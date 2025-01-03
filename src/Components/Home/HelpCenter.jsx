import React from 'react';
import Navbar from "../Home/Navbar.jsx";
import Footer from "../Home/Footer";
import Section5 from "../Home/Section5";
import Section6 from "../Home/Section6";
import "./HelpCenter.css"


function HelpCenter(){
    const vidh ={
        vidh1:"Gradient 2.mp4"
    }
    return(
        <div >
            <video id="background-video"
                  src={vidh.vidh1}       
                  alt = "background video"
                  loop 
                  autoPlay 
                  muted 
                  playsInline
            >
            </video>
            <div className='help'>
                <Navbar/>
                <div id='helps'>
                <Section5/>
                </div>
            </div>
            <Section6/>
            <Footer/>
        </div>
    )
};

export default HelpCenter;