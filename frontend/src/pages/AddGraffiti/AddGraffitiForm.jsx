import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import InputField from "../../components/InputField/InputField";
import Validation from "./AddGraffiriValidator";
import { addGraffiti } from "../../services/userService";
import Header from "../../components/Header/Header";

const AddGraffiti = () => {
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const [values, setValues] = useState({
    image: null,
    name: "",
    style: "",
    description: "",
    likes: 0,
    price: 0,
    quantity: 0,
  });

  const handleClick = () => {
    navigate("/home");
  };

  const handleInput = (event) => {
    const { name, value, type, files } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ValidationErrors = await Validation(values);
    setErrors(ValidationErrors);

    if (Object.keys(ValidationErrors).length === 0) {
      try {
        const formData = new FormData();
        for (let key in values) {
          formData.append(key, values[key]);
        }

        const res = await addGraffiti(formData);
        console.log(res.data);
        alert(res.data.message || "Graffiti added successfully!");
        navigate("/home");
      } catch (err) {
        console.error(err);
        setServerError(
          err.response?.data?.error || "Failed to add graffiti"
        );
      }
    }
  };
  return (
    <>
      <Header />
      <form onSubmit={handleSubmit}>
        {values.image && (
          <img
            src={URL.createObjectURL(values.image)}
            alt="Preview"
            style={{ width: "100px", marginTop: "10px" }}
          />
        )}
        <InputField
          label="Image"
          type="file"
          name="image"
          onChange={handleInput}
          error={errors.image}
        />
        <InputField
          label="Price"
          type="number"
          name="price"
          value={values.price}
          onChange={handleInput}
          error={errors.price}
        />
        <InputField
          label="Quantity"
          type="number"
          name="quantity"
          value={values.quantity}
          onChange={handleInput}
          error={errors.quantity}
        />
        <InputField
          label="Name"
          type="text"
          name="name"
          value={values.name}
          onChange={handleInput}
          error={errors.name}
        />
        <div>
          <label htmlFor="style">Choose your style</label>
          <select
            name="style"
            value={values.style}
            onChange={handleInput}
          >
            <option value="Bubble">Bubble</option>
            <option value="Throw-up">Throw-up</option>
            <option value="Blockbusters">Blockbusters</option>
            <option value="Characters">Characters</option>
            <option value="Essiah">Messiah</option>
            <option value="Wild">Wild</option>
            <option value="Computer Roc">Computer Roc</option>
            <option value="3D / FX">3D / FX</option>
          </select>
          {errors.style && (
            <div style={{ color: "red" }}>{errors.style}</div>
          )}
        </div>

        <div>
          <label htmlFor="description">Description</label> <br />
          <textarea
            name="description"
            value={values.description}
            onChange={handleInput}
          ></textarea>
        </div>
        <input type="submit" value={"submit"} />
      </form>
      <Button onClick={handleClick}>Go home</Button>
    </>
  );
};

export default AddGraffiti;
