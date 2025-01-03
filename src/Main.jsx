import React ,{ useEffect }from 'react';
import Navbar from "./Components/Home/Navbar.jsx";
import Section1 from "./Components/Home/Section1";
import Section2 from "./Components/Home/Section2";
import Section3 from "./Components/Home/Section3";
import Section4 from "./Components/Home/Section4";
import Section5 from "./Components/Home/Section5";
import Section6 from "./Components/Home/Section6";
import Footer from "./Components/Home/Footer";
import Grid from "./Grid";
import { analytics } from './firebase.jsx';
import { logEvent } from "firebase/analytics";
import "./Main.css"

function Home(){
    useEffect(() => {
        // Log an event for visiting the home page
        logEvent(analytics, 'page_view', { page_name: 'Home' });
    }, []);

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
                   playsInline>
            </video>
            <Grid />
            <Navbar/>
            <Section1/>
            <Section2/>
            <Section3/>
            <Section4/>
            <Section5/>
            <Section6/>
            <Footer/>
        </div>
    )
}

export default Home;