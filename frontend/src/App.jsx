import { Outlet } from "react-router-dom";
import NavBar from "./Components/NavBar/NavBar";
import Home from "./Pages/Home";

function App() {
  return (
    <>
      <NavBar />
      <div className=" min-h-[calc(100vh-70px)] pt-18">
        <Outlet />
      </div>
    </>
  );
}

export default App;
