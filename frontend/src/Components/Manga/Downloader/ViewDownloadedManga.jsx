import { useMemo, useState, useEffect } from "react";
import VerticalView from "./VerticalView";
import HorizontalView from "./HorizontalView";

const ViewDownloadedManga = ({ isPreview, imagesData, setImagesData }) => {
  // Initialize horizontal state safely
  const [isHorizontal, setIsHorizontal] = useState(false);

  // Sync isHorizontal with imagesData when it changes
  useEffect(() => {
    setIsHorizontal(imagesData?.isHorizontal ?? false);
  }, [imagesData?.isHorizontal]);

  // Update imagesData whenever horizontal state changes
  useEffect(() => {
    setImagesData((prev) => ({ ...prev, isHorizontal }));
  }, [isHorizontal]);

  // Sort pages numerically
  const sortedPages = useMemo(() => {
    if (!imagesData?.pages) return [];
    return [...imagesData.pages].sort((a, b) => parseInt(a) - parseInt(b));
  }, [imagesData]);

  // Toggle image selection with "@" marker
  const addRemoveImg = (img) => {
    const cleanImg = img.replace(/^@+/, "");

    setImagesData((prev) => {
      const pages = prev.pages.map((p) => {
        const base = p.replace(/^@+/, "");
        if (base === cleanImg) {
          return p.startsWith("@") ? cleanImg : "@" + cleanImg; // toggle
        }
        return p;
      });

      return { ...prev, pages };
    });
  };

  // Edit metadata directly
  const handleEdit = (field, value) => {
    setImagesData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!imagesData?.pages?.length) return null;

  return (
    <div className="mt-6 flex flex-col gap-4 max-w-xl mx-auto">
      {/* Editable metadata */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <label className="font-semibold w-24">Name:</label>
          <input
            type="text"
            value={imagesData.name || ""}
            onChange={(e) => handleEdit("name", e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <label className="font-semibold w-24">Chapter:</label>
          <input
            type="text"
            value={imagesData.ep || ""}
            onChange={(e) => handleEdit("ep", e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <label className="font-semibold w-24">Source:</label>
          <input
            type="text"
            value={imagesData.source || ""}
            onChange={(e) => handleEdit("source", e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Horizontal toggle */}
      <label className="flex items-center gap-2 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={isHorizontal}
          onChange={() => setIsHorizontal((prev) => !prev)}
          className="accent-blue-500"
        />
        Horizontal Reader
      </label>

      {/* Reader views */}
      {!isHorizontal ? (
        <VerticalView
          key="vertical-view"
          isPreview={isPreview}
          sortedPages={sortedPages}
          addRemoveImg={addRemoveImg}
          baseUrl={imagesData.baseUrl}
        />
      ) : (
        <HorizontalView
          key="horizontal-view"
          isPreview={isPreview}
          sortedPages={sortedPages}
          addRemoveImg={addRemoveImg}
          baseUrl={imagesData.baseUrl}
        />
      )}
    </div>
  );
};

export default ViewDownloadedManga;