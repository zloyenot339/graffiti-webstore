import React, { useEffect, useState } from "react";
import Header from "../../components/Header/Header";
import {
  getPosts,
  getUserLikes,
  removeLike,
  removePost,
} from "../../services/userService";
import "../../index.css";
import Button from "@mui/material/Button";

const UserAction = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [userLikes, setUserLikes] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await getPosts();
      setUserPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLikes = async () => {
    try {
      const res = await getUserLikes();
      setUserLikes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveLike = async (graffitiID) => {
    try {
      await removeLike(graffitiID);
      setUserLikes((prev) =>
        prev.filter((item) => item.id !== graffitiID)
      );
    } catch (err) {
      console.error("Error deleting like");
    }
  };

  const handleRemovePost = async (graffitiID) => {
    try {
      await removePost(graffitiID);
      setUserPosts((prev) =>
        prev.filter((post) => post.id !== graffitiID)
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchLikes();
  }, []);

  return (
    <>
      <Header />
      <h2>My posts</h2>
      <div className="wrrapper">
        {userPosts.map((post) => (
          <div className="card" key={post.id}>
            <h3>{post.name}</h3>
            <p>Price: {post.price} $</p>
            <p>Quantity: {post.quantity}</p>

            {post.image && (
              <img
                src={`http://localhost:5000/uploads/${post.image}`}
                alt={post.name}
                width="150"
              />
            )}
            <p>Style: {post.style}</p>
            <p>description: {post.description}</p>
            <p>likes : {post.likes}</p>
            <Button onClick={() => handleRemovePost(post.id)}>
              remove post
            </Button>
          </div>
        ))}
      </div>

      <h2>My likes</h2>
      <div className="wrrapper">
        {userLikes.map((likes) => (
          <div className="card" key={likes.id}>
            <h3>{likes.name}</h3>
            <p>Price: {likes.price} $</p>
            <p>Quantity: {likes.quantity}</p>

            {likes.image && (
              <img
                src={`http://localhost:5000/uploads/${likes.image}`}
                alt={likes.name}
                width="150"
              />
            )}
            <p>Style: {likes.style}</p>
            <p>description: {likes.description}</p>
            <p>likes : {likes.likes}</p>
            <Button onClick={() => handleRemoveLike(likes.id)}>
              remove like
            </Button>
          </div>
        ))}
      </div>
    </>
  );
};

export default UserAction;
