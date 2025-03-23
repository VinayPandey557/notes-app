import React from "react";
import { MdOutlinePushPin } from "react-icons/md";
import { MdCreate, MdDelete } from "react-icons/md";

export const NoteCard = ({
  title,
  date,
  content,
  tags,
  isPinned,
  onEdit,
  onDelete,
  onPinNote,
}) => {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out w-full md:max-w-sm lg:max-w-md overflow-hidden">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="overflow-hidden">
          <h6 className="text-sm font-semibold text-gray-800 truncate">{title}</h6>
          <span className="text-xs text-gray-500">{date}</span>
        </div>
        <MdOutlinePushPin
          className={`cursor-pointer text-lg ${
            isPinned ? "text-blue-500" : "text-gray-300"
          } hover:text-blue-400 transition`}
          onClick={onPinNote}
        />
      </div>

      {/* Content Preview */}
      <p className="text-xs text-gray-600 mt-2 line-clamp-2 break-words">
        {content}
      </p>

      {/* Footer Section */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-500 flex gap-1 flex-wrap max-w-[80%] overflow-hidden">
          {tags?.split(",").map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-[10px] break-words"
            >
              {tag.trim()}
            </span>
          ))}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <MdCreate
            className="text-lg cursor-pointer text-gray-500 hover:text-green-600 transition"
            onClick={onEdit}
          />
          <MdDelete
            className="text-lg cursor-pointer text-gray-500 hover:text-red-500 transition"
            onClick={onDelete}
          />
        </div>
      </div>
    </div>
  );
};
