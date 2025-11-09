import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import "../../index.css";
import Button from "../Button/Button";
import { likeGraffiti } from "../../services/userService";
import { addToCart } from "../../services/userService";

const GraffitiCard = () => {
  const [graffiti, setGraffiti] = useState([]);

  const handleLike = async (id) => {
    try {
      await likeGraffiti(id);
      setGraffiti((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes: item.likes + 1 } : item
        )
      );
    } catch (err) {
      if (
        err.response?.data?.error === "You already liked this post"
      ) {
        alert("You already liked this post 💜");
      } else {
        console.error(err);
      }
    }
  };

  const handleAddToCart = async (id) => {
    try {
      await addToCart(id);
      alert("Added to shopping cart");
    } catch (err) {
      console.error("Error", err);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/graffiti")
      .then((res) => setGraffiti(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="wrrapper">
      {graffiti.map((item) => (
        <div className="card" key={item.id}>
          <h3>{item.name}</h3>
          <p>Price: {item.price} $</p>
          <p>Quantity: {item.quantity}</p>

          {item.image && (
            <img
              src={`http://localhost:5000/uploads/${item.image}`}
              alt={item.name}
              width="150"
            />
          )}
          <p>Style: {item.style}</p>
          <p>description: {item.description}</p>
          <p>likes : {item.likes}</p>
          <div>
            <Button onClick={() => handleLike(item.id)}>💜</Button>{" "}
            <span></span>
            <Button onClick={() => handleAddToCart(item.id)}>
              +Add to cart
            </Button>
          </div>
          <p>Автор: {item.createdBy}</p>
        </div>
      ))}
    </div>
  );
};

export default GraffitiCard;
