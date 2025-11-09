import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./SignupValidation";
import InputField from "../../components/InputField/InputField";
import { signupUser } from "../../services/userService";
import Button from "../../components/Button/Button";

const Signup = () => {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ValidationErrors = Validation(values);
    setErrors(ValidationErrors);
    console.log(
      ValidationErrors,
      Object.keys(ValidationErrors).length
    );

    if (Object.keys(ValidationErrors).length > 0) return;

    try {
      const res = await signupUser(values);
      setServerError(res.data.message || res.data.error);

      alert(res.data.message || res.data.error);
      navigate("/");
    } catch (err) {
      console.error(err);
      setServerError(
        err.response?.data?.error || "Registration failed"
      );
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <InputField
            label="Name"
            type="text"
            name="name"
            value={values.name}
            onChange={handleInput}
            error={errors.name}
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleInput}
            error={errors.email}
          />
          <InputField
            label="Password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleInput}
            error={errors.password}
          />
          <input type="submit" value="Sign Up" />{" "}
          {serverError && (
            <p style={{ color: "red" }}>{serverError}</p>
          )}
          <Button onClick={handleClick}>Login</Button>{" "}
        </form>
      </div>
    </>
  );
};

export default Signup;
