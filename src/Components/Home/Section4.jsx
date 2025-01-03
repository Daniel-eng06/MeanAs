import React, { useState, useEffect } from "react";
import "./Section4.css";
import { Link } from "react-router-dom";
import { analytics } from "../../firebase";
import { logEvent } from "firebase/analytics";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../../firebase";

function Billing() {
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

  // Log analytics event on link click
  const handleLinkClick = (linkPrice) => {
    logEvent(analytics, "link_click", { link_price: linkPrice });
  };

  // Image assets
  const img = {
    blue: "record.png",
    green: "record (1).png",
    orange: "record (2).png",
    spot3: "check-mark.png",
  };

  // Loading state
  if (loading) {
    return <p>Loading...</p>;
  }

  // Render Billing plans
  return (
    <div className="section4">
      <h1>How Can You Get Started?</h1>
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
  );
}

export default Billing;

