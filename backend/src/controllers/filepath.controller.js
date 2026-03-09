import { scanFolderViaPath } from "../utilities/scanFolderViaPath.js";

export const folderExplorer = async (req, res) => {
  const folderPath =
    req.query.path || process.env.DEFAULT_PATH || "/data/data/com.termux/files/home";

  try {
    const paths = await scanFolderViaPath(folderPath);
    res.json(paths);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
