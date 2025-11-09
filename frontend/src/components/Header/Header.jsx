import Button from "../Button/Button";
import { useNavigate } from "react-router-dom";
import "../../index.css";

const Header = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="wrapper-second">
        {" "}
        <h1>Graffiti shop</h1>
        <div className="right-elements">
          {" "}
          <Button
            onClick={() => {
              navigate("/home");
            }}
          >
            🏠
          </Button>{" "}
          <span></span>
          <Button
            onClick={() => {
              navigate("/shoppingcart");
            }}
          >
            🛒
          </Button>{" "}
          <span></span>
          <Button
            onClick={() => {
              navigate("/");
            }}
          >
            🛅
          </Button>{" "}
        </div>
      </div>
    </>
  );
};

export default Header;
