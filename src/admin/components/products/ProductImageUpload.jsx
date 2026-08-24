import React, { useState, useRef } from 'react';
import { Upload, X, Link as LinkIcon, AlertCircle, CheckCircle, ImageIcon } from 'lucide-react';

export default function ProductImageUpload({ images = [], onImagesChange }) {
  const [urlInput, setUrlInput] = useState('');
  const [status, setStatus] = useState(null); // { type: 'error'|'success', msg }
  const [converting, setConverting] = useState(false);
  const fileInputRef = useRef(null);

  // ── Show status then auto-clear ───────────────────────────────────────────
  const showStatus = (type, msg, ms = 3000) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), ms);
  };

  // ── Add image via URL ─────────────────────────────────────────────────────
  const handleUrlAdd = (e) => {
    e.preventDefault();
    const val = urlInput.trim();
    if (!val) return;
    if (!val.startsWith('http')) {
      showStatus('error', 'Please enter a valid URL starting with http(s)://');
      return;
    }
    onImagesChange([...images, val]);
    setUrlInput('');
    showStatus('success', 'Image URL added successfully.');
  };

  // ── Upload file → convert to base64 → store in DB ─────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size (max 2MB)
    if (!file.type.startsWith('image/')) {
      showStatus('error', 'Please select an image file (JPG, PNG, WebP, etc.)');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showStatus('error', 'Image too large. Please use an image under 2MB.');
      e.target.value = '';
      return;
    }

    setConverting(true);
    setStatus(null);

    try {
      const dataUrl = await readFileAsDataURL(file);
      onImagesChange([...images, dataUrl]);
      showStatus('success', `"${file.name}" uploaded successfully.`);
    } catch (err) {
      showStatus('error', 'Failed to read image. Please try again.');
    } finally {
      setConverting(false);
      e.target.value = '';
    }
  };

  // ── Drag & drop support ───────────────────────────────────────────────────
  const handleDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Re-use same logic by triggering synthetic event
    await handleFileUpload({ target: { files: [file], value: '' } });
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleRemoveImage = (idx) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });

  return (
    <div className="space-y-5">

      {/* ── URL Input (Primary) ───────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Add Image via URL
        </p>
        <form onSubmit={handleUrlAdd} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/product.jpg"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/70 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer"
          >
            Add URL
          </button>
        </form>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
          or upload from device
        </span>
        <div className="flex-1 h-px bg-slate-800" />
      </div>

      {/* ── Drag & Drop / File Upload ─────────────────────────────────── */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !converting && fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-violet-500/60 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-950/20 hover:bg-violet-950/10 transition-all cursor-pointer group"
      >
        {converting ? (
          <>
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">
              Processing image…
            </span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-slate-600 group-hover:text-violet-500 mb-3 transition-colors" />
            <p className="text-[11px] font-bold text-slate-400 group-hover:text-slate-300 transition-colors">
              Drag & drop an image here, or click to browse
            </p>
            <p className="mt-1.5 text-[9px] text-slate-600">
              JPG, PNG, WebP · Max 2MB · Saved directly to database
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={converting}
          className="hidden"
        />
      </div>

      {/* ── Status Banner ─────────────────────────────────────────────── */}
      {status && (
        <div
          className={`flex items-start gap-2.5 text-[10px] font-bold uppercase tracking-wide rounded-xl px-4 py-3 transition-all ${
            status.type === 'error'
              ? 'bg-rose-950/50 border border-rose-700/50 text-rose-400'
              : 'bg-emerald-950/50 border border-emerald-700/50 text-emerald-400'
          }`}
        >
          {status.type === 'error'
            ? <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            : <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          }
          <span>{status.msg}</span>
        </div>
      )}

      {/* ── Image Gallery ─────────────────────────────────────────────── */}
      {images.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Product Images&nbsp;
            <span className="text-violet-400 font-bold">({images.length})</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((url, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-slate-800 bg-slate-950/40 p-1.5 group overflow-hidden"
              >
                {url.startsWith('data:') || url.startsWith('http') ? (
                  <img
                    src={url}
                    alt={`Product image ${idx + 1}`}
                    className="h-20 w-full object-contain rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="h-20 w-full rounded-lg bg-slate-800 items-center justify-center hidden"
                >
                  <ImageIcon className="w-6 h-6 text-slate-600" />
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                >
                  <X className="h-3.5 w-3.5" />
                </button>

                {/* Main badge */}
                {idx === 0 && (
                  <span className="absolute bottom-2.5 left-2 text-[8px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
