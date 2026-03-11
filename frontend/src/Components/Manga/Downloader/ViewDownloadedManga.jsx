import { useMemo } from "react";
import VerticalView from "./VerticalView";
import HorizontalView from "./HorizontalView";

const ViewDownloadedManga = ({ isPreview, imagesData, setImagesData }) => {
  const isHorizontal = imagesData?.isHorizontal ?? false;

  const sortedPages = useMemo(() => {
    const pages = imagesData?.pages ?? [];
    return [...pages].sort((a, b) => parseInt(a) - parseInt(b));
  }, [imagesData?.pages]);

  const toggleHorizontal = () => {
    setImagesData((prev) => ({
      ...prev,
      isHorizontal: !prev.isHorizontal,
    }));
  };

  const addRemoveImg = (img) => {
    const cleanImg = img.replace(/^@+/, "");

    setImagesData((prev) => {
      const pages = prev.pages.map((p) => {
        const base = p.replace(/^@+/, "");
        if (base === cleanImg) {
          return p.startsWith("@") ? cleanImg : "@" + cleanImg;
        }
        return p;
      });

      return { ...prev, pages };
    });
  };

  const handleEdit = (field, value) => {
    setImagesData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!imagesData?.pages?.length) return null;

  return (
    <div className="mt-6 flex flex-col gap-4 max-w-[calc(90vw)] mx-auto">
      {/* Metadata */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <label className="font-semibold w-24">Name:</label>
          <input
            value={imagesData.name || ""}
            onChange={(e) => handleEdit("name", e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <label className="font-semibold w-24">Chapter:</label>
          <input
            value={imagesData.ep || ""}
            onChange={(e) => handleEdit("ep", e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
          <label className="font-semibold w-24">Source:</label>
          <input
            value={imagesData.source || ""}
            onChange={(e) => handleEdit("source", e.target.value)}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
      </div>

      {/* Toggle */}
      <label className="flex items-center gap-2 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={isHorizontal}
          onChange={toggleHorizontal}
          className="accent-blue-500"
        />
        Horizontal Reader
      </label>

      {/* Reader */}
      {!isHorizontal ? (
        <VerticalView
          key="vertical"
          isPreview={isPreview}
          sortedPages={sortedPages}
          addRemoveImg={addRemoveImg}
          baseUrl={imagesData.baseUrl}
        />
      ) : (
        <HorizontalView
          key="horizontal"
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
