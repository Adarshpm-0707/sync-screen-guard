import React, { useState, useEffect, useMemo } from 'react';
import { 
  Smartphone, Plus, Trash2, Search, RefreshCw, 
  CheckCircle, Layers, ShieldCheck, X, Sparkles, AlertCircle 
} from 'lucide-react';
import AdminModal from '../components/common/AdminModal';
import { 
  fetchDeviceModels, 
  addDeviceModel, 
  deleteDeviceModel, 
  deleteBrand,
  groupModelsByBrand 
} from '../../utils/deviceModelStore';

const POPULAR_BRAND_SUGGESTIONS = [
  'iPhone', 'Samsung', 'OnePlus', 'Google Pixel', 
  'Vivo', 'Oppo', 'Realme', 'Xiaomi', 'Nothing', 'Motorola'
];

export default function DeviceModels() {
  const [modelsList, setModelsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  // Form state
  const [formBrand, setFormBrand] = useState('iPhone');
  const [customBrand, setCustomBrand] = useState('');
  const [formModelName, setFormModelName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await fetchDeviceModels();
      setModelsList(data || []);
    } catch (err) {
      console.error('Error fetching device models:', err);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    return groupModelsByBrand(modelsList);
  }, [modelsList]);

  const allBrandNames = useMemo(() => {
    return Object.keys(grouped);
  }, [grouped]);

  const totalModelsCount = useMemo(() => {
    return Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  }, [grouped]);

  // Filtered grouped map based on search query
  const filteredGrouped = useMemo(() => {
    if (!searchQuery.trim()) return grouped;
    const q = searchQuery.toLowerCase();
    const result = {};

    Object.keys(grouped).forEach(brand => {
      const brandMatches = brand.toLowerCase().includes(q);
      const matchedModels = grouped[brand].filter(m => m.toLowerCase().includes(q));

      if (brandMatches) {
        result[brand] = grouped[brand];
      } else if (matchedModels.length > 0) {
        result[brand] = matchedModels;
      }
    });

    return result;
  }, [grouped, searchQuery]);

  const handleOpenAddModal = (initialBrand = '') => {
    if (initialBrand) {
      setFormBrand(initialBrand);
      setCustomBrand('');
    } else {
      setFormBrand(allBrandNames[0] || 'iPhone');
      setCustomBrand('');
    }
    setFormModelName('');
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const targetBrand = formBrand === '__custom__' ? customBrand.trim() : formBrand.trim();
    const targetModel = formModelName.trim();

    if (!targetBrand) {
      setFormError('Please select or enter a brand name.');
      return;
    }
    if (!targetModel) {
      setFormError('Please enter the device model name.');
      return;
    }

    setIsSaving(true);
    try {
      await addDeviceModel(targetBrand, targetModel);
      await loadModels();
      setModalOpen(false);
      setNotice(`Added "${targetModel}" under ${targetBrand} successfully!`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Failed to add model.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModel = async (brand, modelName) => {
    if (!window.confirm(`Delete model "${modelName}" from ${brand}?`)) return;

    try {
      // Find matching object if has ID
      const target = modelsList.find(m => m.brand === brand && m.model_name === modelName);
      await deleteDeviceModel(target?.id, brand, modelName);
      setModelsList(prev => prev.filter(m => !(m.brand === brand && m.model_name === modelName)));
      setNotice(`Removed "${modelName}" from ${brand}.`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error('Delete model error:', err);
    }
  };

  const handleDeleteBrand = async (brand) => {
    if (!window.confirm(`Are you sure you want to delete entire brand "${brand}" and all its models?`)) return;

    try {
      await deleteBrand(brand);
      setModelsList(prev => prev.filter(m => m.brand !== brand));
      setNotice(`Deleted brand "${brand}".`);
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error('Delete brand error:', err);
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* ── Control Box Header ── */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
              <Smartphone className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Compatibility Finder Models
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Manage brands and smartphone models shown in the Home page Instant Compatibility dropdowns ({allBrandNames.length} brands, {totalModelsCount} models)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/25 ring-1 ring-white/10 cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Device Model</span>
          </button>

          <button
            onClick={loadModels}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notice Alert */}
      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Supported Brands</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{allBrandNames.length}</span>
            <span className="text-[10px] font-bold text-slate-500">Active</span>
          </div>
        </div>

        <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-md">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Device Models</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{totalModelsCount}</span>
            <span className="text-[10px] font-bold text-emerald-500/80">Available</span>
          </div>
        </div>

        <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-md col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Live Home Finder</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200">Synced to Home Page</span>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl p-4 shadow-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by brand name or device model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090D16]/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* ── Brand & Models Cards Grid ── */}
      {loading ? (
        <div className="p-12 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-3xl">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading device models...</p>
        </div>
      ) : Object.keys(filteredGrouped).length === 0 ? (
        <div className="p-12 text-center bg-[#0E1322]/80 border border-slate-800/80 rounded-3xl text-slate-500 space-y-3">
          <Smartphone className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold uppercase tracking-wider text-slate-400">No matching device models found</p>
          <button
            onClick={() => handleOpenAddModal()}
            className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 cursor-pointer"
          >
            Add First Model
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(filteredGrouped).map((brand) => {
            const models = filteredGrouped[brand];

            return (
              <div
                key={brand}
                className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between"
              >
                <div>
                  {/* Brand Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5">
                      <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-black text-xs">
                        {brand.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-black text-white uppercase tracking-tight">
                          {brand}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {models.length} {models.length === 1 ? 'Model' : 'Models'} Configured
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenAddModal(brand)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        title="Add model to this brand"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>

                      <button
                        onClick={() => handleDeleteBrand(brand)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                        title="Delete entire brand"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Models Chips Grid */}
                  <div className="pt-3 flex flex-wrap gap-2">
                    {models.map((modelName) => (
                      <div
                        key={modelName}
                        className="group inline-flex items-center gap-1.5 bg-[#090D16] border border-slate-800/90 hover:border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition-all shadow-xs"
                      >
                        <span>{modelName}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteModel(brand, modelName)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
                          title="Delete model"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Included in Home Finder</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Model Modal ── */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Device Model"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
          
          {/* Brand Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Smartphone Brand *
            </label>
            <select
              value={formBrand}
              onChange={(e) => setFormBrand(e.target.value)}
              className="w-full bg-[#090D16] border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {allBrandNames.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
              {POPULAR_BRAND_SUGGESTIONS.filter(b => !allBrandNames.includes(b)).map(b => (
                <option key={b} value={b}>+ {b}</option>
              ))}
              <option value="__custom__">+ Add Custom Brand Name</option>
            </select>
          </div>

          {/* Custom Brand Name input if selected */}
          {formBrand === '__custom__' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                New Brand Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Motorola, Asus, Xiaomi"
                value={customBrand}
                onChange={(e) => setCustomBrand(e.target.value)}
                className="w-full bg-[#090D16] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* Model Name Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Exact Model Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. iPhone 17 Pro Max, Galaxy S25 Ultra"
              value={formModelName}
              onChange={(e) => setFormModelName(e.target.value)}
              className="w-full bg-[#090D16] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              This exact model will appear in the model dropdown and search query.
            </p>
          </div>

          {formError && (
            <p className="text-xs font-bold text-rose-400">{formError}</p>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              {isSaving ? 'Saving...' : 'Add Device Model'}
            </button>
          </div>

        </form>
      </AdminModal>

    </div>
  );
}
