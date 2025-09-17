import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImagesUpload: (files: File[]) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onImagesUpload(Array.from(e.target.files));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImagesUpload(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  }, [disabled, onImagesUpload]);

  const baseClasses = "flex flex-col items-center justify-center w-full h-full rounded-2xl border-2 border-dashed transition-all duration-300";
  const disabledClasses = "cursor-not-allowed bg-gray-800/50 border-gray-700";
  const activeClasses = "cursor-pointer bg-gray-800 border-gray-600 hover:bg-gray-700/80";
  const dragOverClasses = "border-purple-500 bg-gray-700/50 ring-2 ring-purple-500/50";
  
  return (
    <div className="w-full h-full p-4">
      <label
        htmlFor="dropzone-file"
        className={`${baseClasses} ${disabled ? disabledClasses : activeClasses} ${isDragging ? dragOverClasses : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <svg className={`w-10 h-10 mb-4 ${disabled ? 'text-gray-500' : 'text-gray-400'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className={`mb-2 text-sm ${disabled ? 'text-gray-500' : 'text-gray-400'}`}>
                <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className={`text-xs ${disabled ? 'text-gray-600' : 'text-gray-500'}`}>For best results, upload high-quality PNG, JPG, WEBP, HEIC, or HEIF.</p>
        </div>
        <input id="dropzone-file" type="file" className="hidden" multiple accept="image/png, image/jpeg, image/webp, image/heic, image/heif" onChange={handleFileChange} disabled={disabled} />
      </label>
    </div>
  );
};

export default ImageUploader;