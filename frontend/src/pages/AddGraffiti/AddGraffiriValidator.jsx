import * as Yup from "yup";

const Validation = async (values) => {
  const schema = Yup.object({
    name: Yup.string().trim().required("Name is required"),

    image: Yup.mixed()
      .required("Image is required")
      .test("fileType", "Only JPEG and PNG allowed", (file) =>
        ["image/jpeg", "image/png"].includes(file?.type)
      )
      .test("fileSize", "File too latge (max 5MB)", (file) =>
        file ? file.size <= 5 * 1024 * 1024 : true
      ),

    style: Yup.string().required("Select a style"),

    quantity: Yup.number()
      .required("Select a quantity")
      .min(1, "Quantity must be at least one"),

    price: Yup.number()
      .required("Select a price")
      .min(1, "Min price starts at $1")
      .max(9999, "Price can't be longer than 4 digits")
      .test("is-decimal", "Max 2 decimal places allowed", (value) =>
        /^\d+(\.\d{1,2})?$/.test(String(value))
      ),

  });

  try {
    await schema.validate(values, { abortEarly: false });
    return {};
  } catch (err) {
    const newErrors = {};
    err.inner.forEach((e) => {
      newErrors[e.path] = e.message;
    });
    return newErrors;
  }
};

export default Validation;
