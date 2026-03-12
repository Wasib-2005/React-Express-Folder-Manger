import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MangaReader = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { ep } = location.state || {}; // get ep safely
  useEffect(()=>{
    if (ep) return
    navigate("/manga-selector")
  },[ep])

  return <div></div>;
};

export default MangaReader;
