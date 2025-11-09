import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import {
  getCart,
  removeFromCart,
  handlePayment,
} from "../../services/userService";
import Button from "@mui/material/Button";
import "../../index.css";

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const fetchCart = async () => {
    try {
      const res = await getCart();
      setCartItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (cartId) => {
    try {
      await removeFromCart(cartId);
      setCartItems((prev) =>
        prev.filter((item) => item.cart_id !== cartId)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await handlePayment(cartItems);
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  return (
    <>
      <Header />
      <div>
        <h1>Shopping Cart</h1>
        <div className="wrrapper">
          {cartItems.length === 0 && <p>Shopping cart is empty</p>}
          {cartItems.map((item) => (
            <div key={item.cart_id} className="card">
              <h3>{item.name}</h3>
              <p>Price: {item.price} $</p>
              <p>Quantity: {item.quantity}</p>
              <p>Product ID: {item.product_id}</p>
              <Button onClick={() => handleRemove(item.cart_id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCheckout}
          disabled={cartItems.length === 0}
        >
          proceed to payment
        </Button>
      </div>
    </>
  );
};

export default ShoppingCart;
