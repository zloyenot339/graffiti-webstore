import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Validation from "./LoginValidation";
import { loginUser } from "../../services/userService";
import InputField from "../../components/InputField/InputField";

const Login = () => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

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
      const res = await loginUser(values);
      setServerError(res.data.message || res.data.error);
      if (res.data.success) {
        localStorage.setItem("accessToken", res.data.accessToken);
        navigate("/home");
      } else {
        setServerError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <>
      <div className="bg-[#15191c]/70 p-4 text-[#F1E9E1] w-67 rounded-md m-10">
        <form
          action=""
          onSubmit={handleSubmit}
          className="sm:text-1xl md:text-2xl lg:text-3xl font-bold"
        >
          <p>Sign up to your account</p>
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
          <div className="space-y-1 space-x-1">
            <button className="bg-[#5D6466] px-2 rounded-sm">
              <input type="submit" value="Sign Up" />
            </button>
            <button className="bg-[#5D6466] px-2 rounded-sm">
              <Link to="/signup">Create Account</Link>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
