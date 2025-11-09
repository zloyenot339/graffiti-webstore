import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/userService";

const Success = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const clearCart = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        await api.post(
          "/clear-cart",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } catch (err) {
        console.error("Failed to clear cart:", err);
      }
    };

    clearCart();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Payment was successfully ended</h1>
      <p>Thenks for your order</p>
      <button onClick={() => navigate("/home")}>
        Back to home page
      </button>
    </div>
  );
};

export default Success;
