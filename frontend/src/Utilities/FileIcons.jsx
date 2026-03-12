import {
  MdFolder,
  MdDescription,
  MdCode,
  MdPictureAsPdf,
  MdMusicNote,
  MdMovie,
  MdArchive,
  MdSettings,
  MdInsertDriveFile,
  MdImage,
} from "react-icons/md";

// Map of file extensions to icons
const extensionIconMap = {
  // Documents
  pdf: <MdPictureAsPdf size={28} className="text-red-500" />,
  doc: <MdDescription size={28} className="text-blue-700" />,
  docx: <MdDescription size={28} className="text-blue-700" />,
  txt: <MdDescription size={28} className="text-gray-600" />,
  xls: <MdDescription size={28} className="text-green-600" />,
  xlsx: <MdDescription size={28} className="text-green-600" />,
  ppt: <MdDescription size={28} className="text-orange-600" />,
  pptx: <MdDescription size={28} className="text-orange-600" />,

  // Code
  js: <MdCode size={28} className="text-yellow-500" />,
  ts: <MdCode size={28} className="text-blue-500" />,
  jsx: <MdCode size={28} className="text-purple-500" />,
  tsx: <MdCode size={28} className="text-purple-500" />,
  py: <MdCode size={28} className="text-blue-400" />,
  java: <MdCode size={28} className="text-red-400" />,
  c: <MdCode size={28} className="text-gray-600" />,
  cpp: <MdCode size={28} className="text-gray-600" />,
  html: <MdCode size={28} className="text-orange-400" />,
  css: <MdCode size={28} className="text-blue-600" />,

  // Media
  mp3: <MdMusicNote size={28} className="text-green-500" />,
  wav: <MdMusicNote size={28} className="text-green-500" />,
  flac: <MdMusicNote size={28} className="text-green-500" />,
  mp4: <MdMovie size={28} className="text-red-500" />,
  mkv: <MdMovie size={28} className="text-red-500" />,
  avi: <MdMovie size={28} className="text-red-500" />,
  mov: <MdMovie size={28} className="text-red-500" />,
  webm: <MdMovie size={28} className="text-red-500" />,

  // Images
  jpg: <MdImage size={28} className="text-blue-400" />,
  jpeg: <MdImage size={28} className="text-blue-400" />,
  png: <MdImage size={28} className="text-blue-400" />,
  gif: <MdImage size={28} className="text-blue-400" />,
  svg: <MdImage size={28} className="text-blue-400" />,
  bmp: <MdImage size={28} className="text-blue-400" />,

  // Archives
  zip: <MdArchive size={28} className="text-orange-500" />,
  rar: <MdArchive size={28} className="text-orange-500" />,
  "7z": <MdArchive size={28} className="text-orange-500" />,
  tar: <MdArchive size={28} className="text-orange-500" />,
  gz: <MdArchive size={28} className="text-orange-500" />,
  iso: <MdArchive size={28} className="text-orange-500" />,
  deb: <MdArchive size={28} className="text-orange-500" />,
  rpm: <MdArchive size={28} className="text-orange-500" />,
  dmg: <MdArchive size={28} className="text-orange-500" />,

  // Programs / executables
  exe: <MdSettings size={28} className="text-gray-600" />,
  msi: <MdSettings size={28} className="text-gray-600" />,
  app: <MdSettings size={28} className="text-gray-600" />,
  flatpak: <MdSettings size={28} className="text-gray-600" />,
  apk: <MdSettings size={28} className="text-gray-600" />,
};

// Browser-safe extension getter
const getExtension = (fileName) => {
  const parts = fileName.split(".");
  if (parts.length > 1) return parts.pop().toLowerCase();
  return "";
};

const FileIcons = ({ fileFolderData }) => {
  if (fileFolderData?.type === "folder")
    return <MdFolder size={28} className="text-yellow-500" />;
  if (fileFolderData?.type === "photo")
    return (
      <img
        className="w-10"
        src={`${import.meta.env.VITE_API_URL}/api/file${fileFolderData?.path}`}
      />
    );

  const ext = getExtension(fileFolderData?.name);
  return (
    extensionIconMap[ext] || (
      <MdInsertDriveFile size={28} className="text-gray-400" />
    )
  );
};

export default FileIcons;
