const InputField = ({ label, type, name, value, onChange, error }) => {
  return (
    <div>
      <lable htmlFor={name}>{label}:</lable> <br />
      <input className="border-3 p-1 m-2 rounded-md"
        type={type}
        name={name}
        value={value}
        placeholder={`Enter your ${label}`}
        onChange={onChange}
      />
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default InputField;
