import React, { useState } from "react";
import "./Section5.css";
import { faqs } from "./Data";
import {Link} from "react-router-dom";

function Facts() {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleToggle = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <div className="section5">
      <h1>FAQs</h1>
      <p>
        For more information, visit the
        <br />
        <Link id="span" to="/helpcenter">MeanAs Help Center</Link>
      </p>
      <div className="popdown">
        {faqs.map((item, index) => (
          <div id="pops" key={item.id}>
            <h3 onClick={() => handleToggle(index)}>
                {item.h3}
                <div id="down"><img src={item.down} alt=""/></div>
            </h3>
            <p className={expandedIndex === index ? "show" : ""}>{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Facts;
