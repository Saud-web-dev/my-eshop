import { useState } from "react";
import { IoClose, IoImage } from "react-icons/io5";

const ImagePreview = ({ images, onRemove, isMultiple = false }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-3">
      {(isMultiple ? images : [images]).map((img, index) => (
        <div
          key={index}
          className="relative group w-24 h-24 rounded-xl overflow-hidden border border-[rgba(99,102,241,0.15)]"
        >
          <img
            src={typeof img === 'string' ? img : img.url || URL.createObjectURL(img)}
            alt={`preview-${index}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={() => onRemove(index)}
              className="text-white hover:text-[#fc8181] transition-colors duration-200"
            >
              <IoClose className="text-xl" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;