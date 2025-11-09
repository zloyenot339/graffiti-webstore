import React from "react";
import Button from "../Button/Button";
import { Navigate, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        onClick={() => {
          navigate("/addGraffiti");
        }}
      >
        Add Graffiti
      </Button>
      <br />

      <Button
        onClick={() => {
          navigate("/userTable");
        }}
      >
        UserTable
      </Button>
      <br />
      <Button
        onClick={() => {
          navigate("/useraction");
        }}
      >
        My profile
      </Button>
    </>
  );
};

export default Sidebar;
