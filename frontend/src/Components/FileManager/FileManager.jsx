import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const FileManager = () => {
  const [query, setQuery] = useSearchParams();

  const path = query.get("path");

  console.log(query);

  return (
    <div>
        {path}
      <ul onClick={() => setQuery({ path: "/" })}>sss</ul>
    </div>
  );
};

export default FileManager;
