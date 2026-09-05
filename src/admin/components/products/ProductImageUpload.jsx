import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Link as LinkIcon, 
  AlertCircle, 
  CheckCircle, 
  ImageIcon, 
  ArrowLeft, 
  ArrowRight, 
  Star, 
  GripVertical, 
  Maximize2, 
  Trash2,
  Sparkles,
  Info,
  Plus,
  Layers,
  FilePlus,
  ClipboardPaste,
  Eye,
  RefreshCw
} from 'lucide-react';

// Curated high quality demo product image packs for 1-click loading
const DEMO_IMAGE_PACKS = [
  {
    name: 'Tempered Glass Full Set',
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80'
    ]
  },
  {
    name: 'Packaging & Installation Box',
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'
    ]
  }
];

export default function ProductImageUpload({ images = [], onImagesChange }) {
  const [urlInput, setUrlInput] = useState('');
  const [bulkUrlInput, setBulkUrlInput] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'error'|'success'|'info', msg }
  const [converting, setConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);
  const fileInputRef = useRef(null);

  // ── Show status notification ─────────────────────────────────────────
  const showStatus = (type, msg, ms = 3500) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), ms);
  };

  // ── Clipboard Paste Listener (Ctrl + V) ──────────────────────────────
  useEffect(() => {
    const handlePaste = async (e) => {
      // If typing in an input/textarea, let normal paste occur
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      for (const item of clipboardItems) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            setConverting(true);
            try {
              const dataUrl = await readFileAsDataURL(file);
              onImagesChange([...images, dataUrl]);
              showStatus('success', 'Pasted image from clipboard successfully!');
            } catch (err) {
              showStatus('error', 'Failed to read pasted image.');
            } finally {
              setConverting(false);
            }
          }
          break;
        } else if (item.type === 'text/plain') {
          item.getAsString((text) => {
            const trimmed = text.trim();
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
              onImagesChange([...images, trimmed]);
              showStatus('success', 'Pasted image URL added to gallery.');
            }
          });
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [images, onImagesChange]);

  // ── Single URL Add ───────────────────────────────────────────────────
  const handleUrlAdd = (e) => {
    e.preventDefault();
    const val = urlInput.trim();
    if (!val) return;
    if (!val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('data:image/')) {
      showStatus('error', 'Please enter a valid image URL starting with http(s)://');
      return;
    }
    onImagesChange([...images, val]);
    setUrlInput('');
    showStatus('success', 'Image URL added to gallery.');
  };

  // ── Bulk Multi-URL Add ───────────────────────────────────────────────
  const handleBulkUrlSubmit = (e) => {
    e.preventDefault();
    if (!bulkUrlInput.trim()) return;

    // Split by newlines, commas, or spaces
    const urls = bulkUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://') || u.startsWith('data:image/'));

    if (urls.length === 0) {
      showStatus('error', 'No valid image URLs found. Make sure URLs start with http:// or https://');
      return;
    }

    onImagesChange([...images, ...urls]);
    setBulkUrlInput('');
    setShowBulkModal(false);
    showStatus('success', `Added ${urls.length} images from bulk URL list!`);
  };

  // ── Helpers ──────────────────────────────────────────────────────────
  const readFileAsDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });

  // ── Upload multiple files at once ────────────────────────────────────
  const handleFileUpload = async (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;

    setConverting(true);
    setStatus(null);

    const validDataUrls = [];
    let errorMsg = null;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      setProgressMsg(`Processing image ${i + 1} of ${fileList.length}...`);

      if (!file.type.startsWith('image/')) {
        errorMsg = 'Some non-image files were skipped.';
        continue;
      }
      if (file.size > 4 * 1024 * 1024) {
        errorMsg = 'Some files exceeded 4MB and were skipped.';
        continue;
      }

      try {
        const dataUrl = await readFileAsDataURL(file);
        validDataUrls.push(dataUrl);
      } catch (err) {
        errorMsg = 'Failed to process some images.';
      }
    }

    if (validDataUrls.length > 0) {
      onImagesChange([...images, ...validDataUrls]);
      showStatus(
        'success', 
        `Added ${validDataUrls.length} image${validDataUrls.length > 1 ? 's' : ''} to product.`
      );
    } else if (errorMsg) {
      showStatus('error', errorMsg);
    }

    setConverting(false);
    setProgressMsg('');
    if (e.target) e.target.value = '';
  };

  // ── Drag & Drop Files from Desktop ───────────────────────────────────
  const handleFileDrop = async (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      await handleFileUpload({ target: { files: droppedFiles, value: '' } });
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // ── Load Preset Demo Image Pack ──────────────────────────────────────
  const handleLoadDemoPack = (pack) => {
    onImagesChange([...images, ...pack.images]);
    showStatus('success', `Added ${pack.images.length} photos from "${pack.name}".`);
  };

  // ── Clear All Images ─────────────────────────────────────────────────
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all images for this product?')) {
      onImagesChange([]);
      showStatus('info', 'All product photos have been cleared.');
    }
  };

  // ── Reordering Functions ─────────────────────────────────────────────
  const moveImage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= images.length || fromIdx === toIdx) return;
    const newArr = [...images];
    const [movedItem] = newArr.splice(fromIdx, 1);
    newArr.splice(toIdx, 0, movedItem);
    onImagesChange(newArr);
  };

  const moveToFirst = (fromIdx) => {
    if (fromIdx === 0) return;
    moveImage(fromIdx, 0);
    showStatus('success', 'Moved photo to 1st position (Main Storefront Cover).');
  };

  const handleRemoveImage = (idx) => {
    const isMain = idx === 0;
    const newArr = images.filter((_, i) => i !== idx);
    onImagesChange(newArr);
    if (isMain && newArr.length > 0) {
      showStatus('info', 'First image removed. Next photo is now the Cover.');
    }
  };

  // ── Drag & Drop for Card Rearranging ─────────────────────────────────
  const handleItemDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleItemDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      moveImage(draggedIdx, targetIdx);
      showStatus('success', `Reordered to Position #${targetIdx + 1}`);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleItemDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="space-y-5">
      {/* ── Guidance Banner ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-violet-500/15 via-indigo-500/10 to-slate-900 border border-violet-500/25 text-slate-300 shadow-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <p className="font-extrabold text-violet-200 uppercase tracking-wider">
              Product Photography & Gallery Studio
            </p>
            <p className="text-slate-400 text-[10px] mt-0.5">
              Add multiple images, reorder sequence with <span className="text-slate-200 font-bold">◀ ▶</span> or drag-and-drop. The <span className="text-amber-300 font-bold">1st image</span> is always the primary storefront catalog cover.
            </p>
          </div>
        </div>

        {/* Quick Quick Demo Pack Dropdown / Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-center">
          {DEMO_IMAGE_PACKS.map((pack) => (
            <button
              key={pack.name}
              type="button"
              onClick={() => handleLoadDemoPack(pack)}
              className="px-2.5 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 hover:border-violet-500 text-violet-300 hover:text-white text-[10px] font-bold transition-all cursor-pointer shadow-sm"
              title={`Add ${pack.images.length} sample photos`}
            >
              + {pack.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Action Bars: URL, Multi-URL & File Upload Options ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Single Web URL Bar */}
        <div className="lg:col-span-8 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Add Single Image Link
            </span>
            <button
              type="button"
              onClick={() => setShowBulkModal(!showBulkModal)}
              className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3" />
              <span>{showBulkModal ? 'Hide Bulk URLs' : 'Paste Multiple URLs'}</span>
            </button>
          </div>

          <form onSubmit={handleUrlAdd} className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/product-photo.jpg"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-md shadow-violet-600/20 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL</span>
            </button>
          </form>
        </div>

        {/* Quick Batch Upload CTA */}
        <div className="lg:col-span-4 flex flex-col justify-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
          >
            <FilePlus className="w-4 h-4 text-violet-400" />
            <span>Select Multiple Files</span>
          </button>
        </div>
      </div>

      {/* ── Bulk Multi-URL Textarea Dropdown ─────────────────────────── */}
      {showBulkModal && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-violet-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-violet-400" />
              Bulk Add Multiple Image URLs
            </span>
            <span className="text-[10px] text-slate-400">1 URL per line or separated by comma</span>
          </div>
          <textarea
            rows="4"
            value={bulkUrlInput}
            onChange={(e) => setBulkUrlInput(e.target.value)}
            placeholder={`https://example.com/front-view.jpg\nhttps://example.com/side-angle.jpg\nhttps://example.com/box-packaging.jpg`}
            className="w-full rounded-xl border border-slate-800 bg-[#090D16] p-3 text-white focus:border-violet-500 focus:outline-none font-mono text-xs resize-none leading-relaxed"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowBulkModal(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkUrlSubmit}
              className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
            >
              Add All URLs
            </button>
          </div>
        </div>
      )}

      {/* ── Drag & Drop Large Upload Area ───────────────────────────── */}
      <div
        onDrop={handleFileDrop}
        onDragOver={handleDragOver}
        onClick={() => !converting && fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-800 hover:border-violet-500/60 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center bg-slate-950/40 hover:bg-violet-950/10 transition-all cursor-pointer group relative overflow-hidden"
      >
        {converting ? (
          <div className="flex flex-col items-center py-2">
            <div className="w-9 h-9 border-3 border-violet-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wide">
              {progressMsg || 'Processing & compressing images...'}
            </span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
              <Upload className="h-6 w-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
              Drag & drop multiple photos here, or <span className="text-violet-400 underline decoration-violet-400/50 underline-offset-4">browse device</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[10px] text-slate-500 font-semibold">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                ⚡ Select multiple photos at once
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                📋 Press Ctrl + V anywhere to paste
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                JPG, PNG, WebP · Max 4MB each
              </span>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          disabled={converting}
          className="hidden"
        />
      </div>

      {/* ── Status Toast Banner ─────────────────────────────────────── */}
      {status && (
        <div
          className={`flex items-start gap-2.5 text-[11px] font-bold rounded-2xl px-4 py-3 transition-all animate-fadeIn ${
            status.type === 'error'
              ? 'bg-rose-950/60 border border-rose-700/50 text-rose-300'
              : status.type === 'info'
              ? 'bg-sky-950/60 border border-sky-700/50 text-sky-300'
              : 'bg-emerald-950/60 border border-emerald-700/50 text-emerald-300'
          }`}
        >
          {status.type === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          ) : status.type === 'info' ? (
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-sky-400" />
          ) : (
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
          )}
          <span>{status.msg}</span>
        </div>
      )}

      {/* ── Image Gallery & Rearrange Cards ─────────────────────────── */}
      {images.length > 0 && (
        <div className="space-y-3.5 pt-2">
          {/* Gallery Subheader */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Product Gallery
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-black">
                {images.length} {images.length === 1 ? 'image' : 'images'} added
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600 border border-violet-500/30 text-violet-300 hover:text-white text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add More</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {images.map((url, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === images.length - 1;
              const isDragging = draggedIdx === idx;
              const isOver = dragOverIdx === idx;

              return (
                <div
                  key={`${url.slice(0, 30)}-${idx}`}
                  draggable
                  onDragStart={(e) => handleItemDragStart(e, idx)}
                  onDragOver={(e) => handleItemDragOver(e, idx)}
                  onDrop={(e) => handleItemDrop(e, idx)}
                  onDragEnd={handleItemDragEnd}
                  className={`relative rounded-2xl border transition-all duration-200 bg-slate-900/90 overflow-hidden flex flex-col group ${
                    isFirst 
                      ? 'border-violet-500/60 ring-1 ring-violet-500/30 shadow-lg shadow-violet-950/30' 
                      : 'border-slate-800 hover:border-slate-700 shadow-md'
                  } ${isDragging ? 'opacity-40 scale-95 border-dashed border-violet-400' : ''} ${
                    isOver && !isDragging ? 'border-indigo-400 ring-2 ring-indigo-400/40 scale-[1.02]' : ''
                  }`}
                >
                  {/* Card Header Bar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="cursor-grab active:cursor-grabbing p-0.5 text-slate-500 hover:text-slate-300"
                        title="Drag to rearrange sequence"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      
                      {isFirst ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                          1. Main Cover
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-extrabold text-[9px] uppercase tracking-wider">
                          Position #{idx + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Zoom / Lightbox */}
                      <button
                        type="button"
                        onClick={() => setPreviewImage(url)}
                        title="Enlarge Photo"
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Delete Photo"
                        className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Image Display Area */}
                  <div 
                    onClick={() => setPreviewImage(url)}
                    className="relative h-36 w-full bg-slate-950/60 p-2 flex items-center justify-center cursor-pointer overflow-hidden"
                  >
                    {url.startsWith('data:') || url.startsWith('http') ? (
                      <img
                        src={url}
                        alt={`Product Photo ${idx + 1}`}
                        className="max-h-full max-w-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="h-full w-full rounded-lg bg-slate-800 items-center justify-center hidden">
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    </div>
                  </div>

                  {/* Rearrange Action Controls Footer */}
                  <div className="p-2.5 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1.5">
                    {/* Shift Left & Right Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx - 1)}
                        disabled={isFirst}
                        title={isFirst ? 'Already first position' : `Move left to #${idx}`}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isFirst
                            ? 'bg-slate-900/60 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-violet-600 text-slate-200 hover:text-white border border-slate-700 active:scale-95'
                        }`}
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Left</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => moveImage(idx, idx + 1)}
                        disabled={isLast}
                        title={isLast ? 'Already last position' : `Move right to #${idx + 2}`}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                          isLast
                            ? 'bg-slate-900/60 text-slate-600 border border-slate-800/50 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-violet-600 text-slate-200 hover:text-white border border-slate-700 active:scale-95'
                        }`}
                      >
                        <span>Right</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Quick "Set as Cover / Move to 1st" button for non-first items */}
                    {!isFirst ? (
                      <button
                        type="button"
                        onClick={() => moveToFirst(idx)}
                        title="Set this image as primary storefront cover"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 text-amber-300 hover:text-slate-950 font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer active:scale-95 ml-auto"
                      >
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300 group-hover:fill-slate-950" />
                        <span>Make Cover</span>
                      </button>
                    ) : (
                      <span className="text-[9px] font-extrabold text-violet-400 uppercase tracking-widest ml-auto pr-1">
                        ⭐ Main Display
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Inline "+ Add More Image" Card at the end of the list */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-800 hover:border-violet-500/60 bg-slate-950/20 hover:bg-violet-950/10 transition-all flex flex-col items-center justify-center text-center p-4 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-violet-500/20 transition-all">
                <Plus className="w-5 h-5 text-violet-400 group-hover:text-violet-300" />
              </div>
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                + Add Another Image
              </span>
              <span className="text-[9px] text-slate-500 mt-0.5">
                Click or drop files
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Image Fullscreen Lightbox Modal ─────────────────────────── */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-3 shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Full Size Photography Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 max-h-[75vh] flex items-center justify-center overflow-auto">
              <img
                src={previewImage}
                alt="Enlarged Preview"
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


