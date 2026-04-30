import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

/* ───────────────────────────────────────────────────────
   getCroppedImg
   Converts the crop area into a Blob using an offscreen Canvas
──────────────────────────────────────────────────────── */
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
    const image = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));

    // Canvas size to contain rotated image
    canvas.width = image.width * cos + image.height * sin;
    canvas.height = image.width * sin + image.height * cos;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    // Crop from rotated canvas
    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;
    const croppedCtx = croppedCanvas.getContext('2d');

    croppedCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise(resolve =>
        croppedCanvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9)
    );
}

/* ───────────────────────────────────────────────────────
   ASPECT RATIO PRESETS
──────────────────────────────────────────────────────── */
const ASPECTS = [
    { label: '16:10 (Recommended)', value: 16 / 10 },
    { label: '16:9 (Widescreen)', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '1:1 (Square)', value: 1 },
];

/* ───────────────────────────────────────────────────────
   ThumbnailCropper Modal
   Props:
     imageSrc   — object URL of the selected file
     onApply    — cb(blob) called when admin confirms crop
     onCancel   — cb() closes the modal without changes
──────────────────────────────────────────────────────── */
const ThumbnailCropper = ({ imageSrc, onApply, onCancel, defaultAspect = 16 / 10 }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspect, setAspect] = useState(defaultAspect);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [applying, setApplying] = useState(false);

    const onCropComplete = useCallback((_, cropPixels) => {
        setCroppedAreaPixels(cropPixels);
    }, []);

    const handleApply = async () => {
        if (!croppedAreaPixels) return;
        setApplying(true);
        try {
            const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
            onApply(blob);
        } catch (err) {
            console.error('Crop failed:', err);
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-[900px] rounded-[24px] shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: '96vh', height: '100%' }}>

                {/* Header */}
                <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-[18px] font-bold text-[#0f172a]">Adjust Thumbnail</h2>
                        <p className="text-[12px] text-[#64748b] font-medium mt-0.5">
                            Drag to reposition · Scroll or use slider to zoom · Rotate if needed
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Crop Area — flexible height */}
                <div className="relative bg-[#0f172a] flex-1 min-h-[200px]">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        showGrid={true}
                        style={{
                            containerStyle: { borderRadius: 0 },
                            cropAreaStyle: {
                                border: '2px solid #3b82f6',
                                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
                            },
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="px-5 md:px-8 py-4 md:py-6 space-y-4 md:space-y-5 flex-shrink-0 overflow-y-auto max-h-[35vh]">

                    {/* Aspect Ratio Tabs */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2.5">Aspect Ratio</label>
                        <div className="flex gap-2 flex-wrap">
                            {ASPECTS.map(a => (
                                <button
                                    key={a.label}
                                    onClick={() => setAspect(a.value)}
                                    className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all border ${aspect === a.value
                                        ? 'bg-[#3b82f6] text-white border-[#3b82f6] shadow-sm'
                                        : 'bg-gray-50 text-[#64748b] border-gray-200 hover:border-[#3b82f6] hover:text-[#3b82f6]'
                                        }`}
                                >
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Zoom Slider */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2.5">
                            Zoom — {Math.round(zoom * 100)}%
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setZoom(z => Math.max(1, z - 0.1))}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <ZoomOut size={16} className="text-gray-600" />
                            </button>
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={e => setZoom(Number(e.target.value))}
                                className="flex-1 accent-[#3b82f6]"
                            />
                            <button
                                onClick={() => setZoom(z => Math.min(3, z + 0.1))}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                            >
                                <ZoomIn size={16} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Rotation Slider */}
                    <div>
                        <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-2.5">
                            Rotation — {rotation}°
                        </label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setRotation(0)}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                                title="Reset rotation"
                            >
                                <RotateCcw size={15} className="text-gray-600" />
                            </button>
                            <input
                                type="range"
                                min={-180}
                                max={180}
                                step={1}
                                value={rotation}
                                onChange={e => setRotation(Number(e.target.value))}
                                className="flex-1 accent-[#3b82f6]"
                            />
                            <span className="text-[12px] text-[#64748b] font-bold w-10 text-right">{rotation}°</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 md:px-8 py-3.5 border-t border-gray-100 flex justify-between items-center flex-shrink-0 bg-white gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 md:flex-none px-4 md:px-8 py-2 md:py-2.5 bg-gray-100 text-[#64748b] font-bold rounded-xl hover:bg-gray-200 transition-all text-[13px] md:text-[14px]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        disabled={applying}
                        className="flex-[1.5] md:flex-none px-5 md:px-10 py-2 md:py-2.5 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-blue-600 transition-all text-[13px] md:text-[14px] flex items-center justify-center gap-2 disabled:opacity-60 shadow-sm"
                    >
                        {applying
                            ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Applying…</>
                            : <><Check size={16} /> Apply & Upload</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThumbnailCropper;
