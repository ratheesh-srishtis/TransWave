import React from "react";
import { Link } from "react-router-dom";
import "../css/notfound.css";
const object = require("../assets/images/Objects.png");
const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <div className="notfoundobject">
      <img src={object} className="userimg"></img>
      <div className="fouzerofour">404 </div>
      </div>
      
      <div className="pagenotfound">
      Page Not Found
      </div>
      <div>The page you are looking for does not exist.</div>
      
    </div>
  );
};

export default NotFound;
