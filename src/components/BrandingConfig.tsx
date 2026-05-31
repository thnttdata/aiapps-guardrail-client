import React, { useState } from 'react';
import { 
  Sparkles, Image as LucideImage, Link2, Upload, Loader2, AlertCircle, X, Check, Eye 
} from 'lucide-react';
import { AppConfig, AppConfigUpdate } from '../types';
import { apiService } from '../services/api';
import MagicFantasyIcon from './MagicFantasyIcon';
import kdmTitanProImg from '../assets/kdm_titan_pro.png';

interface BrandingConfigProps {
  config: AppConfig;
  handleConfigUpdate: (updates: Partial<AppConfigUpdate>) => Promise<void>;
  setMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>>;
  appendConsoleLog: (
    category: 'SYSTEM' | 'CONFIG' | 'SECURITY' | 'SIMULATION' | 'SANDBOX',
    level: 'INFO' | 'WARN' | 'ERROR' | 'VIOLATION',
    message: string
  ) => void;
}

const BrandingConfig: React.FC<BrandingConfigProps> = ({
  config,
  handleConfigUpdate,
  setMessage,
  appendConsoleLog
}) => {
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const [heroDragOver, setHeroDragOver] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [heroError, setHeroError] = useState<string | null>(null);

  const handleLogoUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setLogoError('File size exceeds the 5MB limit.');
      return;
    }
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setLogoError('Unsupported format. Please upload PNG, JPG, GIF, WEBP, or SVG.');
      return;
    }

    setLogoError(null);
    setIsUploadingLogo(true);
    appendConsoleLog('CONFIG', 'INFO', `Initiating White-Label logo asset upload sequence: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    try {
      const response = await apiService.uploadBrandingAsset(file);
      await handleConfigUpdate({ logo_url: response.url });
      appendConsoleLog('CONFIG', 'INFO', `Logo uploaded and deployed successfully. Asset target URL: ${response.url}`);
      setMessage({ type: 'success', text: 'Logo uploaded and updated successfully!' });
    } catch (err: any) {
      appendConsoleLog('CONFIG', 'ERROR', `Logo upload transaction failed: ${err.message || String(err)}`);
      console.error(err);
      setLogoError('Failed to upload logo. Please try again.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleHeroUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setHeroError('File size exceeds the 5MB limit.');
      return;
    }
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setHeroError('Unsupported format. Please upload PNG, JPG, GIF, WEBP, or SVG.');
      return;
    }

    setHeroError(null);
    setIsUploadingHero(true);
    appendConsoleLog('CONFIG', 'INFO', `Initiating White-Label hero banner asset upload sequence: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    try {
      const response = await apiService.uploadBrandingAsset(file);
      await handleConfigUpdate({ hero_image_url: response.url });
      appendConsoleLog('CONFIG', 'INFO', `Hero image uploaded and deployed successfully. Asset target URL: ${response.url}`);
      setMessage({ type: 'success', text: 'Hero image uploaded and updated successfully!' });
    } catch (err: any) {
      appendConsoleLog('CONFIG', 'ERROR', `Hero banner upload transaction failed: ${err.message || String(err)}`);
      console.error(err);
      setHeroError('Failed to upload hero image. Please try again.');
    } finally {
      setIsUploadingHero(false);
    }
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setLogoDragOver(true);
  };

  const handleLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setLogoDragOver(false);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setLogoDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleHeroDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setHeroDragOver(true);
  };

  const handleHeroDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setHeroDragOver(false);
  };

  const handleHeroDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setHeroDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleHeroUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
            White-Label Branding Suite
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload icons, customize banners, modify theme colors, and preview changes instantly before saving.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        {/* Form Controls (xl:col-span-3) */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={config.business_name || ''}
                onChange={(e) => handleConfigUpdate({ business_name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 text-sm font-medium"
                placeholder="Enter business name..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={config.tagline || ''}
                onChange={(e) => handleConfigUpdate({ tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 text-sm font-medium"
                placeholder="Enter brand tagline..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hero Text
              </label>
              <textarea
                value={config.hero_text || ''}
                onChange={(e) => handleConfigUpdate({ hero_text: e.target.value })}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 text-sm font-medium leading-relaxed"
                placeholder="Describe your product flagships or services..."
              />
            </div>

            {/* Logo Section */}
            <div className="md:col-span-2 border-t border-gray-100 pt-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <LucideImage className="w-4 h-4 text-primary-500" />
                  Brand Logo Icon
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Paste an image URL or drag and drop a custom icon file (PNG, JPG, SVG, WEBP - Max 5MB)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={config.logo_url || ''}
                      onChange={(e) => handleConfigUpdate({ logo_url: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 text-xs font-mono"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={handleLogoDragOver}
                    onDragLeave={handleLogoDragLeave}
                    onDrop={handleLogoDrop}
                    className={`border-2 border-dashed rounded-xl p-4 transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
                      logoDragOver 
                        ? 'border-primary-500 bg-primary-500/5 scale-[0.99]' 
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/50'
                    }`}
                    onClick={() => document.getElementById('logo-file-input')?.click()}
                  >
                    <input
                      id="logo-file-input"
                      type="file"
                      accept=".png,.jpg,.jpeg,.gif,.webp,.svg,image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleLogoUpload(e.target.files[0]);
                        }
                      }}
                    />
                    {isUploadingLogo ? (
                      <div className="flex flex-col items-center space-y-2 py-1">
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                        <span className="text-xs text-gray-500 font-semibold">Uploading brand logo...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1 py-1">
                        <Upload className={`w-6 h-6 ${logoDragOver ? 'text-primary-500 animate-bounce' : 'text-gray-400'}`} />
                        <span className="text-xs text-gray-600 font-semibold">
                          Drag logo here or <span className="text-primary-600 underline">browse</span>
                        </span>
                      </div>
                    )}
                  </div>
                  {logoError && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{logoError}</span>
                    </div>
                  )}
                </div>

                {/* Current Logo Preview */}
                <div className="flex flex-col items-center justify-center border border-gray-100 bg-gray-50 rounded-xl p-3 h-full min-h-[110px]">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Current Logo</span>
                  <div className="relative p-1.5 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-center w-14 h-14 overflow-hidden">
                    {config.logo_url && config.logo_url !== '/favicon.svg' ? (
                      <img src={config.logo_url} alt="Logo Preview" className="w-12 h-12 object-contain rounded-xl" />
                    ) : (
                      <MagicFantasyIcon size={36} />
                    )}
                  </div>
                  {config.logo_url && config.logo_url !== '/favicon.svg' && (
                    <button
                      onClick={() => handleConfigUpdate({ logo_url: '/favicon.svg' })}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-0.5 mt-2 transition-colors"
                    >
                      <X className="w-3 h-3" /> Reset Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Hero Banner Section */}
            <div className="md:col-span-2 border-t border-gray-100 pt-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <LucideImage className="w-4 h-4 text-primary-500" />
                  Hero Banner Showcase
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Paste a banner URL or upload a custom image (PNG, JPG, SVG, WEBP - Max 5MB)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={config.hero_image_url || ''}
                      onChange={(e) => handleConfigUpdate({ hero_image_url: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-gray-900 text-xs font-mono"
                      placeholder="https://example.com/banner.png"
                    />
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={handleHeroDragOver}
                    onDragLeave={handleHeroDragLeave}
                    onDrop={handleHeroDrop}
                    className={`border-2 border-dashed rounded-xl p-4 transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
                      heroDragOver 
                        ? 'border-primary-500 bg-primary-500/5 scale-[0.99]' 
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100/50'
                    }`}
                    onClick={() => document.getElementById('hero-file-input')?.click()}
                  >
                    <input
                      id="hero-file-input"
                      type="file"
                      accept=".png,.jpg,.jpeg,.gif,.webp,.svg,image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleHeroUpload(e.target.files[0]);
                        }
                      }}
                    />
                    {isUploadingHero ? (
                      <div className="flex flex-col items-center space-y-2 py-1">
                        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
                        <span className="text-xs text-gray-500 font-semibold">Uploading brand banner...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-1 py-1">
                        <Upload className={`w-6 h-6 ${heroDragOver ? 'text-primary-500 animate-bounce' : 'text-gray-400'}`} />
                        <span className="text-xs text-gray-600 font-semibold">
                          Drag banner here or <span className="text-primary-600 underline">browse</span>
                        </span>
                      </div>
                    )}
                  </div>
                  {heroError && (
                    <div className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{heroError}</span>
                    </div>
                  )}
                </div>

                {/* Current Hero Preview */}
                <div className="flex flex-col items-center justify-center border border-gray-100 bg-gray-50 rounded-xl p-3 h-full min-h-[110px]">
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-2">Current Banner</span>
                  <div className="relative p-0.5 rounded-xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-center w-full h-14 overflow-hidden bg-slate-900">
                    <img 
                      src={config.hero_image_url === '/src/assets/kdm_titan_pro.png' ? kdmTitanProImg : (config.hero_image_url || kdmTitanProImg)} 
                      alt="Banner Preview" 
                      className="w-full h-full object-contain rounded-lg" 
                    />
                  </div>
                  {config.hero_image_url && config.hero_image_url !== '/src/assets/kdm_titan_pro.png' && (
                    <button
                      onClick={() => handleConfigUpdate({ hero_image_url: '/src/assets/kdm_titan_pro.png' })}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-0.5 mt-2 transition-colors"
                    >
                      <X className="w-3 h-3" /> Reset Default
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Theme Accent Section */}
            <div className="md:col-span-2 border-t border-gray-100 pt-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Theme Selection
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'blue', label: 'Blue Tech', desc: 'Default AI Tech Accent', bg: 'bg-blue-500' },
                  { id: 'emerald', label: 'Emerald FinTech', desc: 'Sleek Emerald Palette', bg: 'bg-emerald-500' },
                  { id: 'purple', label: 'Purple SaaS', desc: 'Vibrant Cosmic Indigo', bg: 'bg-purple-500' },
                  { id: 'amber', label: 'Amber Enterprise', desc: 'Premium Golden Warmth', bg: 'bg-amber-500' }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleConfigUpdate({ theme: t.id })}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      config.theme === t.id 
                        ? 'border-primary-500 bg-primary-50/20 ring-2 ring-primary-500/10' 
                        : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${t.bg} ring-2 ring-white shadow-sm`} />
                      {config.theme === t.id && (
                        <Check className="w-3.5 h-3.5 text-primary-600 font-bold" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{t.label}</span>
                    <span className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Real-time Interactive Mockup Card (xl:col-span-2) */}
        <div className="xl:col-span-2 space-y-4 sticky top-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              Live Visual Mockup
            </span>
            <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 animate-pulse bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Synced
            </span>
          </div>

          {/* Browser Mockup Window */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#08080d] shadow-2xl relative">
            {/* Window Controls Decorator */}
            <div className="bg-[#050508]/80 border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/60" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
                <span className="w-2 h-2 rounded-full bg-green-500/60" />
              </div>
              <div className="bg-[#12121e] border border-white/5 rounded-md px-12 py-1 text-[10px] text-gray-500 select-none truncate max-w-[180px] font-mono">
                {config.business_name ? `${config.business_name.toLowerCase().replace(/\s+/g, '')}.com` : 'landing-page.com'}
              </div>
              <div className="w-12" />
            </div>

            {/* Simulated Landing Page Body */}
            <div className="p-4 h-[420px] overflow-hidden flex flex-col justify-between relative bg-[#050508] select-none text-white font-sans text-[11px]">
              
              {/* Background Ambient Glow driven by active theme color */}
              <div className={`absolute top-0 right-1/4 w-32 h-32 rounded-full blur-[40px] pointer-events-none opacity-40 transition-all duration-700 ${
                config.theme === 'emerald' ? 'bg-emerald-500/20' :
                config.theme === 'purple' ? 'bg-purple-500/20' :
                config.theme === 'amber' ? 'bg-amber-500/20' :
                'bg-blue-500/20'
              }`} />

              {/* Header */}
              <header className="flex justify-between items-center border-b border-white/5 pb-2.5 z-10">
                <div className="flex items-center space-x-2">
                  <div className="relative p-0.5 rounded-lg bg-white/5 border border-white/10 shadow-sm flex items-center justify-center overflow-hidden w-6 h-6">
                    {config.logo_url && config.logo_url !== '/favicon.svg' ? (
                      <img src={config.logo_url} alt="Logo" className="w-full h-full object-contain rounded-md" />
                    ) : (
                      <MagicFantasyIcon size={22} />
                    )}
                  </div>
                  <div>
                    <div className="font-extrabold tracking-tight text-white leading-none max-w-[80px] truncate text-[10px]">
                      {config.business_name || 'Brand Name'}
                    </div>
                    <div className="text-[7px] text-gray-500 leading-none max-w-[80px] truncate mt-0.5 uppercase tracking-wider font-semibold">
                      {config.tagline || 'Tagline'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Lakera Shield Pill */}
                  <div className="flex items-center space-x-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full scale-[0.85] origin-right">
                    <span className="relative flex h-1 w-1">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        config.lakera_enabled ? 'bg-emerald-400' : 'bg-amber-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-1 w-1 ${
                        config.lakera_enabled ? 'bg-emerald-500' : 'bg-amber-500'
                      }`} />
                    </span>
                    <span className="text-[8px] text-gray-400 font-semibold">Lakera</span>
                  </div>
                </div>
              </header>

              {/* Hero Section */}
              <div className="grid grid-cols-12 gap-3 items-center my-auto z-10 py-2">
                {/* Hero Text */}
                <div className="col-span-7 space-y-2">
                  {/* Live Dynamic Glow Badge */}
                  <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[8px] font-bold border transition-all duration-300 ${
                    config.theme === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    config.theme === 'purple' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                    config.theme === 'amber' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                  }`}>
                    <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                    <span>Flagship Demo</span>
                  </div>

                  <h3 className="text-xs font-extrabold tracking-tight text-white leading-snug">
                    {config.business_name === 'KDMPhoneShop' ? (
                      <>
                        KDM Titan Pro <br />
                        <span className={`bg-gradient-to-r bg-clip-text text-transparent font-bold transition-all duration-500 ${
                          config.theme === 'emerald' ? 'from-emerald-400 to-teal-400' :
                          config.theme === 'purple' ? 'from-purple-400 to-pink-400' :
                          config.theme === 'amber' ? 'from-amber-400 to-orange-400' :
                          'from-blue-400 to-indigo-400'
                        }`}>
                          Titanium. Meets AI.
                        </span>
                      </>
                    ) : (
                      config.business_name || 'Your Company Name'
                    )}
                  </h3>

                  <p className="text-[8px] text-gray-400 leading-normal line-clamp-3">
                    {config.business_name === 'KDMPhoneShop' ? 'The ultimate fusion of premium titanium structure and state-of-the-art Generative AI. Explore comparison benchmarks, dynamic neural routing, and direct conversational catalogs built securely.' : (config.hero_text || 'Configure your custom hero description here to explain your product features and invite clients to test the secure AI sandbox demo.')}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5 pt-1 scale-95 origin-left">
                    <span className={`px-2.5 py-1 rounded-lg text-white font-bold tracking-wide transition-all shadow-sm text-[8px] ${
                      config.theme === 'emerald' ? 'bg-emerald-600 shadow-emerald-900/20' :
                      config.theme === 'purple' ? 'bg-purple-600 shadow-purple-900/20' :
                      config.theme === 'amber' ? 'bg-amber-600 shadow-amber-900/20' :
                      'bg-blue-600 shadow-blue-900/20'
                    }`}>
                      Interactive AI Demo
                    </span>
                    <span className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 text-gray-300 font-bold tracking-wide text-[8px]">
                      Catalog
                    </span>
                  </div>
                </div>

                {/* Hero Image Mockup Area */}
                <div className="col-span-5 flex items-center justify-center relative">
                  <div className="relative group">
                    {/* Ambient background blur behind phone/banner */}
                    <div className={`absolute inset-0 blur-2xl rounded-full opacity-50 transition-all duration-500 ${
                      config.theme === 'emerald' ? 'bg-emerald-500/20' :
                      config.theme === 'purple' ? 'bg-purple-500/20' :
                      config.theme === 'amber' ? 'bg-amber-500/20' :
                      'bg-blue-500/20'
                    }`} />
                    <img
                      src={config.hero_image_url === '/src/assets/kdm_titan_pro.png' ? kdmTitanProImg : (config.hero_image_url || kdmTitanProImg)}
                      alt="Mockup Phone"
                      className="h-32 w-auto object-contain drop-shadow-[0_10px_25px_rgba(245,158,11,0.1)] animate-float"
                    />
                  </div>
                </div>
              </div>

              {/* Footer mock bar */}
              <footer className="flex justify-between items-center border-t border-white/5 pt-2 text-[6px] text-gray-500 mt-auto">
                <span>© 2026 {config.business_name || 'Brand LLC'}. All rights reserved.</span>
                <div className="flex space-x-1.5 font-semibold">
                  <span>Secure Portal</span>
                  <span>-</span>
                  <span>Privacy Policy</span>
                </div>
              </footer>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BrandingConfig;
