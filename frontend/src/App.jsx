import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import AddGraffiti from "./pages/AddGraffiti/AddGraffitiForm";
import UserTable from "./pages/UserTable/UserTable";
import ShoppingCart from "./pages/Shoping/ShoppingCart";
import Success from "./components/Success";
import Cancel from "./components/Cancel";
import UserAction from "./pages/UserAction/UserAction";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/signup" element={<Signup />}></Route>
        <Route path="/home" element={<Home />}></Route>
        <Route path="/addGraffiti" element={<AddGraffiti />}></Route>
        <Route path="/userTable" element={<UserTable />}></Route>
        <Route path="/success" element={<Success />}></Route>
        <Route path="/cancel" element={<Cancel />}></Route>
        <Route
          path="/shoppingcart"
          element={<ShoppingCart />}
        ></Route>
        <Route path="/useraction" element={<UserAction />}></Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
