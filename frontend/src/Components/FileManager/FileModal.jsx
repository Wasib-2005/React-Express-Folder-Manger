import { CiSaveDown2 } from "react-icons/ci";
import FileIcons from "../../Utilities/FileIcons";
import { autoFormatSize } from "../../Utilities/formatSize";
import { formatDate } from "../../Utilities/formatDate";
import { Link } from "react-router-dom";
import VideoPlayer from "../../Utilities/VideoPlayer";


const FileModal = ({ filePathAndTypeName, isModalOpen, setIsModalOpen }) => {
  if (!isModalOpen || !filePathAndTypeName?.type) return null;

  const baseURL = import.meta.env.VITE_API_URL;

  // Common modal layout
  const ModalWrapper = ({ children }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-base-300/80"
        onClick={() => setIsModalOpen(false)}
      />
      {/* Modal content */}
      <div
        className="relative bg-base-100 p-6 glass rounded-xl max-w-md w-full z-10 shadow-lg mx-2"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  // Photo modal
  if (filePathAndTypeName.type === "photo") {
    return (
      <ModalWrapper>
        <div className="mb-4 text-center">
          <img
            src={`${baseURL}/api/file${filePathAndTypeName.path}`}
            alt={filePathAndTypeName.name}
            className="max-h-[60vh] w-auto mx-auto rounded-lg shadow-md"
          />
        </div>
        <div className="mb-4 text-center">
          <h1 className="text-lg font-semibold">{filePathAndTypeName.name}</h1>
          <p className="text-sm text-gray-400">
            Size: {autoFormatSize(filePathAndTypeName.size)} | Modified:{" "}
            {formatDate(filePathAndTypeName.modified, "dd MMM yyyy")}
          </p>
        </div>
        <div className="text-center mt-2 flex justify-around">
          <a
            href={`${baseURL}/api/file${filePathAndTypeName.path}`}
            rel="noreferrer"
            className="btn btn-outline btn-success flex items-center w-[46%]"
          >
            <CiSaveDown2 />
            Download Photo
          </a>
          <Link className="btn btn-outline btn-info flex items-center w-[46%]">
            Edit
          </Link>
        </div>
      </ModalWrapper>
    );
  }

  // video modal
  if (filePathAndTypeName.type === "video") {
    return (
      <ModalWrapper>
        <div className="mb-4">
          <VideoPlayer src={`${baseURL}/api/file${filePathAndTypeName.path}`} />
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-lg font-semibold">{filePathAndTypeName.name}</h1>
          <p className="text-sm text-gray-400">
            Size: {autoFormatSize(filePathAndTypeName.size)} | Modified:{" "}
            {formatDate(filePathAndTypeName.modified, "dd MMM yyyy")}
          </p>
        </div>

        <div className="text-center mt-2 flex justify-around">
          <a
            href={`${baseURL}/api/file${filePathAndTypeName.path}`}
            className="btn btn-outline btn-success flex items-center w-[46%]"
          >
            <CiSaveDown2 />
            Download Video
          </a>
        </div>
      </ModalWrapper>
    );
  }

  // File modal

  return (
    <ModalWrapper>
      <div className="flex gap-4 mb-4">
        <FileIcons fileFolderData={filePathAndTypeName} />
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-2">{filePathAndTypeName.name}</h1>
          <hr className="border-dashed mb-2" />
          <div className="flex justify-between mb-2 text-sm">
            <div>
              <p>Size: {autoFormatSize(filePathAndTypeName.size)}</p>
              <p>Type: {filePathAndTypeName.type}</p>
            </div>
            <div>
              <p>
                Created:{" "}
                {formatDate(filePathAndTypeName.created, "dd MMM yyyy")}
              </p>
              <p>
                Modified:{" "}
                {formatDate(filePathAndTypeName.modified, "dd MMM yyyy")}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 break-all">
            Path: {filePathAndTypeName.path}
          </p>
        </div>
      </div>
      <div className="text-center mt-4">
        <a
          href={`${baseURL}/api/file${filePathAndTypeName.path}`}
          rel="noreferrer"
          className="btn btn-outline btn-success flex items-center gap-2"
        >
          <CiSaveDown2 />
          Download the file
        </a>
      </div>
    </ModalWrapper>
  );
};

export default FileModal;
