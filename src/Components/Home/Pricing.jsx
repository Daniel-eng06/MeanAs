import React, { useState, useEffect } from "react";
import "./Pricing.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Link } from "react-router-dom";
import { analytics } from '../../firebase';
import { logEvent } from "firebase/analytics";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";

function Pricing() {
  const handleLinkClick = (linkPrices) => {
    // Log the click event with a specific link name
    logEvent(analytics, 'link_click', { link_prices: linkPrices });
  };
  const image = {
    vid1: "Gradient 2.mp4",
  };
 


  const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
  
    // Fetch data from Firestore
    useEffect(() => {
      const fetchData = async () => {
        try {
          const querySnapshot = await getDocs(query(collection(db, "Plans"), orderBy('order')));
          const items = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData(items);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching data: ", error);
          setLoading(false);
        }
      };
  
      fetchData();
    }, []);
  
    // Loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  const img = {
    blue: "record.png",
    green: "record (1).png",
    orange: "record (2).png",
    spot3: "check-mark.png",
  };


  return (
    <div className="allprices">
      <video id="background-video" 
        src={image.vid1} 
              alt = "background video"
              loop 
              autoPlay 
              muted 
              playsInline
      />
      <Navbar />
      <div className="price">
        <h1>Our Pricing Plans</h1>
        <p>Choose the plan that is right for you. Whether you are a small business, a growing enterprise, researcher, engineering student or non-engineering student curious about FEA/CFD analysis, we have a plan that fits your needs and budget. Explore our flexible pricing options and get started today!</p>
      </div>
      <div className="section4">
       <div className="bill">
               {data.map((item) => (
                 <div key={item.id} id={item.order === 2 ? 'unique' : 'free'}>
                   { item.order === 2 && <p id="popu">Most Popular</p> }
                   <div className="spo">
                     <div id="spot">
                       <img src={img[item.color]} alt="Icon" />
                     </div>
                     <h3 id={item.color}>{item.name}</h3>
                   </div>
       
                   <p id="price">
                     {item.price === 0 ? "Free" : `$${item.price}`}
                     <span> / {item.duration} </span>
                   </p>
       
                   <ul className="pack">
                       <li>
                           <p>{item.name} includes:</p>
                       </li>
                       {item.features.map((feature, index) =>
                           <li key={index}>
                               <div><img src={img.spot3} alt="Check mark" /></div>
                           {feature}
                       </li>
                     )}
                   </ul>
       
                   <Link
                     className={item.color}
                     to={item.order === 1 ? "/dashboard" : `/paymentflow/${item.id}`}
                     state={{ plan: item.name }}
                     onClick={() =>
                       handleLinkClick(item.btnText)
                     }
                   >
                    {item.btnText}
                   </Link>
                 </div>
               ))}
             </div>
           </div>
      <Footer />
    </div>
  );
}

export default Pricing;
