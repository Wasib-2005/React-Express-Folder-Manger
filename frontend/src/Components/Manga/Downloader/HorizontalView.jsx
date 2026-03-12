const HorizontalView = ({ sortedPages, baseUrl, addRemoveImg, isPreview }) => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!sortedPages?.length) return null;

  return (
    <div className="w-full">
      {/* Horizontally scrollable row */}
      <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth px-1">
        {sortedPages.map((img, i) => {
          const isRemoved = img.includes("@");
          if (isPreview && isRemoved) return null;

          return (
            <div
              key={`${img + i}`}
              onClick={() => addRemoveImg(img)}
              className={`
                snap-start shrink-0 cursor-pointer rounded-lg overflow-hidden shadow
                transition-opacity
                w-[75vw] sm:w-[320px] md:w-[280px]
                ${isRemoved ? "opacity-20" : "opacity-100"}
              `}
            >
              <img
                src={`${apiUrl}/api/file${baseUrl}/${img.replace("@", "")}`}
                alt={`Page ${i + 1}`}
                loading="lazy"
                className="w-full object-contain"
              />
              <div className="flex justify-between items-center px-2 py-1 bg-base-200 text-xs">
                <span className="opacity-60">Page {i + 1}</span>
                <input
                  type="checkbox"
                  defaultChecked={!isRemoved}
                  onClick={(e) => { e.stopPropagation(); addRemoveImg(img); }}
                  className="checkbox checkbox-xs"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalView;