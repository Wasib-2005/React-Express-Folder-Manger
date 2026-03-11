import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ShowTheActivePath from "./ShowTheActivePath";
import axios from "axios";
import FileManagerManu from "./FileManagerManu";

const FileManager = () => {
  const [query] = useSearchParams();
  const [fileFolderPathData, setfileFolderPathData] = useState({});

  const path = query.get("path");

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_API_URL}/api/paths${path ? `?path=${path}` : ""}`,
      )
      .then((e) => setfileFolderPathData(e.data));
  }, [path]);

  return (
    <div className="-2">
      <ShowTheActivePath currentLocation={fileFolderPathData.location} />
      <FileManagerManu fileFolderPathData={fileFolderPathData} />
      <hr className="glass" /> 
    </div>
  );
};

export default FileManager;
