import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import Button from './Button';
import Modal from './Modal';

const createCroppedFile = (imageUrl, area, originalFile) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const scale = Math.min(1, 1920 / area.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(area.width * scale);
    canvas.height = Math.round(area.height * scale);
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Your browser could not prepare the cropped image.'));
      return;
    }

    context.drawImage(
      image,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('The cropped image could not be created.'));
        return;
      }

      const baseName = originalFile.name.replace(/\.[^.]+$/, '') || 'image';
      resolve(new File([blob], `${baseName}-cropped.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  };
  image.onerror = () => reject(new Error('The selected image could not be opened.'));
  image.src = imageUrl;
});

const ImageCropDialog = ({ file, title, aspect, onCancel, onCrop }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setImageUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setError('');
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleCrop = async () => {
    if (!imageUrl || !croppedArea) return;
    setProcessing(true);
    setError('');
    try {
      const croppedFile = await createCroppedFile(imageUrl, croppedArea, file);
      onCrop(croppedFile);
    } catch (cropError) {
      setError(cropError.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal
      open={Boolean(file)}
      onClose={onCancel}
      title={title}
      size="2xl"
      footer={(
        <>
          <Button type="button" variant="ghost" onClick={onCancel} disabled={processing}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCrop} loading={processing} disabled={!croppedArea}>
            Use cropped image
          </Button>
        </>
      )}
    >
      <p className="text-sm text-text-muted mb-3">Drag the image to adjust the crop, then use the zoom control if needed.</p>
      <div className="relative h-[min(55vh,480px)] min-h-64 w-full overflow-hidden rounded-lg bg-black">
        {imageUrl && (
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedArea(pixels)}
          />
        )}
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm text-text-secondary">
        <span>Zoom</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.05"
          value={zoom}
          onChange={event => setZoom(Number(event.target.value))}
          className="w-full accent-accent"
        />
      </label>
      {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
    </Modal>
  );
};

export default ImageCropDialog;
