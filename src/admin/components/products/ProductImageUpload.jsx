import React, { useState } from 'react';
import { Upload, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import AdminButton from '../common/AdminButton';

export default function ProductImageUpload({ images = [], onImagesChange }) {
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [diagnostics, setDiagnostics] = useState('');
  const [diagnosing, setDiagnosing] = useState(false);

  const handleUrlAdd = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onImagesChange([...images, urlInput.trim()]);
      setUrlInput('');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    onImagesChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Best-effort automatic bucket creation
      try {
        await supabase.storage.createBucket('product-images', { public: true });
      } catch (e) {
        // Ignore error if it already exists or if client permissions restrict bucket management
      }

      // Upload file to Supabase storage bucket 'product-images'
      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onImagesChange([...images, publicUrl]);
    } catch (err) {
      console.error('Error uploading image to Supabase:', err);
      setError(err.message || 'Failed to upload image asset.');
    } finally {
      setUploading(false);
    }
  };

  const runDiagnostics = async () => {
    setDiagnosing(true);
    setDiagnostics('Running...');
    try {
      const currentUrl = supabase.supabaseUrl;
      const keyLength = supabase.supabaseKey?.length || 0;
      let logs = `Supabase URL: ${currentUrl}\nKey Length: ${keyLength}\n`;

      logs += 'Testing connection... ';
      const { data: dbTest, error: dbError } = await supabase.from('products').select('id').limit(1);
      if (dbError) {
        logs += `FAIL (${dbError.message})\n`;
      } else {
        logs += 'OK (Connected to Products)\n';
      }

      logs += 'Checking Storage... ';
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        logs += `FAIL (${bucketsError.message})\n`;
      } else {
        const bucketNames = buckets.map(b => b.name).join(', ') || 'none';
        logs += `OK (Found buckets: ${bucketNames})\n`;
      }

      logs += 'Attempting to create bucket... ';
      const { data: createData, error: createError } = await supabase.storage.createBucket('product-images', { public: true });
      if (createError) {
        logs += `FAIL (${createError.message})\n`;
      } else {
        logs += 'SUCCESS (Created/Verified bucket)\n';
      }

      setDiagnostics(logs);
    } catch (err) {
      setDiagnostics(prev => prev + `\nUnexpected Error: ${err.message}`);
    } finally {
      setDiagnosing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* File selector */}
      <div className="w-full">
        {/* Supabase Storage File Upload */}
        <div className="border border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-950/20 hover:border-primary-500/50 transition-colors">
          <Upload className="h-8 w-8 text-slate-550 mb-2" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Upload via Supabase Storage</span>
          <label className="mt-3 inline-flex items-center justify-center px-4 py-2 border border-slate-800 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:bg-slate-800">
            {uploading ? 'Uploading...' : 'Choose File'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              disabled={uploading} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-rose-450 uppercase tracking-wide">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          
          <div className="pt-1">
            <button
              type="button"
              onClick={runDiagnostics}
              disabled={diagnosing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-705 border border-slate-700 hover:border-slate-650 rounded-lg text-[9px] font-bold text-slate-350 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
            >
              {diagnosing ? 'Diagnosing...' : 'Diagnose Storage & Environment'}
            </button>
          </div>

          {diagnostics && (
            <pre className="p-3 bg-slate-950 border border-slate-800 text-[10px] text-left text-slate-300 font-mono rounded-xl overflow-x-auto whitespace-pre-wrap">
              {diagnostics}
            </pre>
          )}
        </div>
      )}

      {/* Grid gallery of current images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative rounded-xl border border-slate-850 bg-slate-950/40 p-1.5 group overflow-hidden">
              <img 
                src={url} 
                alt={`Product thumbnail ${idx + 1}`} 
                className="h-20 w-full object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-1 rounded-lg bg-rose-650/90 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
