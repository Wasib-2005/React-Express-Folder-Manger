const apiUrl = import.meta.env.VITE_API_URL;

const VerticalView = ({ sortedPages, baseUrl, addRemoveImg, isPreview }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {sortedPages.map((img, index) => (
        <div
          key={`v${img + index}`}
          className={` ${img.includes("@") ? "opacity-20" : ""}  ${isPreview && img.includes("@") ? "hidden" : ""} `}
        >
          <div className="flex justify-center items-center gap-x-4 border px-2">
            <span className="text-sm opacity-70">Page: {index + 1}</span>

            <img
              src={`${apiUrl}/api/file${baseUrl}/${img.replace("@", "")}`}
              onClick={() => addRemoveImg(img)}
              alt={`Page ${index + 1}`}
              loading="lazy"
              className="w-[70%] object-contain"
            />
            <hr />
            <input
              type="checkbox"
              defaultChecked={!img.includes("@")}
              onClick={() => addRemoveImg(img)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default VerticalView;
