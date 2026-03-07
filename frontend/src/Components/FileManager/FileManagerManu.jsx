const FileManagerManu = ({ fileFolderPathData }) => {
  const { folderFile } = fileFolderPathData;
  console.log(folderFile);
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Size</th>
        </tr>
      </thead>
      {folderFile?.map((e, i) => (
        <li key={`${e}${i}`} className="flex justify-between">
          <span>{e.name}</span>
          <span>{e.type}</span>
          <span>{e.size}</span>
        </li>
      ))}
    </table>
  );
};

export default FileManagerManu;
