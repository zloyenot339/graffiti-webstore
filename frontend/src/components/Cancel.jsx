import React from "react";
import { useNavigate } from "react-router-dom";

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Payment was canceled</h1>
      <p>You can try again</p>
      <button onClick={() => navigate("/shoppingcart")}>Back to shopping cart</button>
    </div>
  );
};

export default Cancel;