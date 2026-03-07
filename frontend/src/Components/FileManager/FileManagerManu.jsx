import { formatDate } from "../../Utilities/formatDate";

const FileManagerManu = ({ fileFolderPathData }) => {
  const { folderFile } = fileFolderPathData;
  console.log(folderFile);
  return (
    <ul className=" grid gap-1">
      <hr />
      {folderFile?.map((e, i) => (
        <li key={`${e}${i}`} className="grid px-2 ">
          <span className="px-1 py-2 block btn btn-ghost h-auto text-left ">
            <span className="font-bold text-xl text-wrap">{e.name}</span>
            <span className="flex justify-between">
              <span className="">Size: {e.size}</span>
              <span className="">
                Created: {formatDate(e.created, "dd MMM yyyy")}
              </span>
            </span>
            <span className="flex justify-between">
              <span className="">Type: {e.type}</span>
              <span className="">
                modified: {formatDate(e.modified, "dd MMM yyyy")}
              </span>
            </span>
          </span>
          <hr className="mt-1" />
        </li>
      ))}
    </ul>
  );
};

export default FileManagerManu;
