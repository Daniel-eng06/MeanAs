import React ,{ useEffect }from 'react';
import Footer from "../Home/Footer";
import Grid from "../../Grid";
import SideBar from "./SideBar";
import Section6 from "../Home/Section6";
import { analytics } from '../../firebase';
import { logEvent } from "firebase/analytics";
import "./Dashboard.css"


function Dashboard(){
    useEffect(() => {
        // Log an event for visiting the User Dashboard
        logEvent(analytics, 'dashboard_view', { page_name: 'UserDashboard' });
    }, []);

    const vid ={
        vid1:"Gradient 2.mp4"
    }
    return(
        <div className="dashboard">
           <video id="background-video"
                  src={vid.vid1}      
                  alt = "background video"
                  loop 
                  autoPlay 
                  muted 
                  playsInline
          >
           </video>
           <Grid/>
           <SideBar/>
           <Section6/>
           <Footer/>
        </div>
    )
}


export default Dashboard;