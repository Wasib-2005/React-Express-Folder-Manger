import { scanFolderViaPath } from "../utilities/scanFolderViaPath.js";

export const basicFolderExplorer = async (req, res) => {
  const folderPath = req.query.path;
  if (!folderPath) return res.status(400).json({ error: "path query missing" });

  try {
    const paths = await scanFolderViaPath(folderPath);
    res.json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const defaultFolderExplorer = async (req, res) => {

  
  try {
    const paths = await scanFolderViaPath("./src/Storages");
    res.json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
