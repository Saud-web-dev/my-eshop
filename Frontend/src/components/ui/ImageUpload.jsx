import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import { MdCloudUpload, MdClose } from 'react-icons/md';

const ImageUpload = ({
  multiple = false,
  value = [],
  onChange,
  maxFiles = 10,
  accept = 'image/*',
  label = 'Upload Images',
  className,
}) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, maxFiles - value.length);
    onChange?.(arr);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const remove = (idx) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange?.(next, true);
  };

  return (
    <div className={clsx('space-y-3', className)}>
      {label && <p className="text-sm font-medium text-text-secondary">{label}</p>}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          'border-2 border-dashed rounded-card p-8 text-center cursor-pointer transition-all duration-200',
          dragging
            ? 'border-accent bg-accent/5 scale-[1.01]'
            : 'border-border hover:border-accent/50 hover:bg-surface-raised'
        )}
      >
        <MdCloudUpload className="mx-auto text-4xl text-text-muted mb-2" />
        <p className="text-sm text-text-secondary font-medium">
          {dragging ? 'Drop files here' : 'Click or drag & drop images'}
        </p>
        <p className="text-xs text-text-muted mt-1">
          PNG, JPG, WEBP up to 5MB {multiple && `(max ${maxFiles})`}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {value.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              <img
                src={typeof img === 'string' ? img : (img.url || URL.createObjectURL(img))}
                alt={`upload-${idx}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); remove(idx); }}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5
                           opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <MdClose size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
