const HorizontalView = ({ sortedPages, baseUrl, addRemoveImg, isPreview }) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!sortedPages?.length) return null;

  return (
    <div className="flex flex-col gap-3 w-screen px-10">
      {/* Images Row */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {sortedPages.map((img, i) => (
          <div
            key={`${img + i}`}
            className={`min-w-[350px] object-contain rounded-md shadow ${img.includes("@") ? "opacity-20" : ""}  ${isPreview && img.includes("@") ? "hidden" : ""} `}
          >
            <img
              src={`${apiUrl}/api/file${baseUrl}/${img.replace("@", "")}`}
              alt={img}
              loading="lazy"
              className="w-[350px]"
            />
            <p className="flex justify-center gap-2 items-center mt-2">
              <span className="text-sm opacity-70">Page: {i + 1}</span>

              <input
                type="checkbox"
                defaultChecked={!img.includes("@")}
                onClick={() => addRemoveImg(img)}
              />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalView;
