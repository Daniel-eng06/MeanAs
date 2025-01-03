import React from 'react';
import "./Section1.css"
import {Link} from "react-router-dom";
import { analytics } from '../../firebase';
import { logEvent } from "firebase/analytics";


function Salescopy() {
    const handleLinkClick = (linkName) => {
        // Log the click event with a specific link name
        logEvent(analytics, 'link_click', { link_name: linkName });
      };

    const softwareimg = {
        img1:"Ansys.png",
        img2:"Abaqus.png",
        img3:"Cosmol.png",
        img4:"Solidworks.png",
        img5:"Autodesk Fusion 360.png",
        img6:"OpenFoam.png",
        vid:"full screen.mp4"
    }
    return(
        <div className='section1'>
            <div className="heading">
                <h1>Access Fast Clarity & Accuracy
                    Before and After Your FEA/CFD Analysis in <span id='tw'>Two Steps</span>
                </h1>
                <p>
                Unlock expert-level insights with our AI-powered platform for FEA/CFD analysis. No CAE expertise needed.
                 From smarter material selection to precise result interpretation, elevate your projects with confidence and clarity.
                </p>
            </div>
            <ul className="call">
                <li><Link id="call2" to="/authentication?q=free" onClick={() => handleLinkClick('Try For Free')}>Try For Free</Link></li>
                <li><Link id="call1" to="/pricing" onClick={() => handleLinkClick('Access Clarity Now')}>Access Clarity Now</Link></li>
            </ul>
            <div className="software">
                <p>Trusted to Assist and Interpret Videos, Images and Data from</p>
                <div className="complogo">
                    <div id="complog"><img src={softwareimg.img1} alt="Ansys"/></div>
                    <div id="complog"><img src={softwareimg.img2} alt="Abaqus"/></div>
                    <div id="complog"><img src={softwareimg.img3} alt="Comsol"/></div>
                    <div id="complog"><img src={softwareimg.img4} alt="Solidworks"/></div>
                    <div id="complog"><img src={softwareimg.img5} alt="Fusion 360"/></div>
                    <div id="complog"><img src={softwareimg.img6} alt="OpenFoam"/></div>
                </div>
            </div>
            <div className="video">
                <video 
                    src={softwareimg.vid} 
                    alt="MeanAs Video Description" 
                    loop 
                    autoPlay 
                    muted 
                    playsInline
                ></video>
            </div>
        </div>
    )

}

export default Salescopy;