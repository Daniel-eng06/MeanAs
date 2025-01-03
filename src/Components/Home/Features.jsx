import React from 'react';
import Navbar from "../Home/Navbar.jsx";
import Section2 from "../Home/Section2";
import Footer from "../Home/Footer";
import "./Features.css";


function Features(){
    const vid ={
        vid1:"Gradient 2.mp4"
    }
    return(
        <div className="background">
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
            <div id='margin'>
                <Section2/>
            </div>
            <Footer/>
        </div>
    )
};

export default Features;

