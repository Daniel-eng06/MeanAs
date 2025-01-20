import React from "react";
import "./Section3.css"

function Workprocess() {
    const quo ={
        quote:"quote.png",
        tut:"preprocess.mp4",
        tut1:"postprocess.mp4"
    }
    return(
        <div className="phonescreen">
            <div className="section3">
                <h1>How Does It Work?</h1>
                <div className="steps">
                    <div className="tutorial">
                        <video 
                            src={quo.tut}
                            alt="MeanAs Video Description" 
                            loop 
                            autoPlay 
                            muted 
                            playsInline>
                        </video>
                    </div>
                    <div id="process">
                        <h2>Clarity & Accuracy<br/> For Pre-Processing</h2>
                        <ul>
                            <li>Upload your specific 3D CAD model effortlessly.</li>
                            <li>Select analysis type, material range, and software.</li>
                            <li>Click Generate Clarity and <span>Boom!!!</span>
                                <br/>MeanAs produces the clarity and confidence you need.</li>
                        </ul>
                    </div>
                </div>
                <div className="steps1">
                    <div id="process">
                        <h2>Clarity & Accuracy<br/> For Post-Processing</h2>
                        <ul>
                            <li>Upload your confused analysis result images and plots.</li>
                            <li>Select analysis type, detail level, and type materials used.</li>
                            <li>Click Generate Clarity and <span>Boom!!!</span>
                                <br/>MeanAs produces the clarity and insight you need.</li>
                        </ul>
                    </div>
                    <div className="tutorial">
                        <video src={quo.tut1}
                          alt="MeanAs Video Description" 
                          loop 
                          autoPlay 
                          muted 
                          playsInline>
                        </video>
                    </div>
                </div>
                <div className="testimony">
                    <div><img src={quo.quote}/></div>
                    <p id="testa">Amidst confusion over FEA/CFD analysis during my internship, MeanAs provided invaluable clarity from start to finish. Their expert guidance enabled me to deliver high-quality results swiftly, impressing my boss and aligning my research with strict deadlines.
                        MeanAs not only enhanced my understanding but also elevated <br/> my project's credibility, ensuring a successful outcome and advancing my career in engineering analysis.</p>
                    <p id="testam">Dan Hills</p>
                </div>
            </div>
        </div>
    )
}

export default Workprocess;