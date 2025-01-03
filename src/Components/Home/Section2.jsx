import React from 'react';
import "./Section2.css"
import {benefit} from "./Data.jsx"
import {Link} from "react-router-dom";


function Benefits() {
    return(
        <div className="section2">
            <h1>What's In It For You?</h1>
            <div className="benefit" >
             {benefit.map((item) => (
                    <div id='bene' key={item.id}>
                        <div><img src={item.img} alt={item.alt}/></div>
                        <h2>{item.h2}</h2>
                        <p>{item.description}</p>
                    </div>
            ))}
            </div>
            <ul className="callbar">
                <li><Link to="/authentication?q=free"  id="call3">Try For Free</Link></li>
                <li><Link to="/pricing" id="call1">Access Clarity Now</Link></li>
            </ul>
        </div>

    )
}
export default Benefits;