import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Download, Shield, Loader2, Server, Activity, Layers, Database, Trash2, Copy, PlusCircle, Check, AlertCircle, Plus, RefreshCw
} from 'lucide-react';
import { AppConfig } from '../types';
import { apiService } from '../services/api';

interface BackupRestoreProps {
  config: AppConfig;
  loadConfig: () => Promise<void>;
  loadModels?: () => Promise<void>;
  appendConsoleLog: (
    category: 'SYSTEM' | 'CONFIG' | 'SECURITY' | 'SIMULATION' | 'SANDBOX',
    level: 'INFO' | 'WARN' | 'ERROR' | 'VIOLATION',
    message: string
  ) => void;
  ragManagementRef: React.RefObject<any>;
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
}

const themeStyles: Record<string, {
  border: string;
  gradient: string;
  badge: string;
  iconBg: string;
  iconText: string;
  buttonBg: string;
  buttonHover: string;
  textTheme: string;
}> = {
  blue: {
    border: 'border-blue-500/25 hover:border-blue-500/50',
    gradient: 'from-blue-500 to-indigo-500',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
    iconBg: 'bg-blue-50 border-blue-100',
    iconText: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    buttonHover: 'hover:bg-blue-700',
    textTheme: 'text-blue-600',
  },
  emerald: {
    border: 'border-emerald-500/25 hover:border-emerald-500/50',
    gradient: 'from-emerald-500 to-teal-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    iconBg: 'bg-emerald-50 border-emerald-100',
    iconText: 'text-emerald-600',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    buttonHover: 'hover:bg-emerald-700',
    textTheme: 'text-emerald-600',
  },
  amber: {
    border: 'border-amber-500/25 hover:border-amber-500/50',
    gradient: 'from-amber-500 to-yellow-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
    iconBg: 'bg-amber-50 border-amber-100',
    iconText: 'text-amber-600',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
    buttonHover: 'hover:bg-amber-700',
    textTheme: 'text-amber-600',
  },
  purple: {
    border: 'border-purple-500/25 hover:border-purple-500/50',
    gradient: 'from-purple-500 to-pink-500',
    badge: 'bg-purple-50 text-purple-700 border-purple-100',
    iconBg: 'bg-purple-50 border-purple-100',
    iconText: 'text-purple-600',
    buttonBg: 'bg-purple-600 hover:bg-purple-700',
    buttonHover: 'hover:bg-purple-700',
    textTheme: 'text-purple-600',
  },
};

const dotColors: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
};

const getPresetIcon = (themeName: string, iconTextClass: string) => {
  switch (themeName) {
    case 'emerald': return <Server className={`w-6 h-6 ${iconTextClass}`} />;
    case 'amber': return <Activity className={`w-6 h-6 ${iconTextClass}`} />;
    case 'purple': return <Layers className={`w-6 h-6 ${iconTextClass}`} />;
    default: return <Database className={`w-6 h-6 ${iconTextClass}`} />;
  }
};

const getPresetHighlights = (presetName: string) => {
  switch (presetName.toUpperCase()) {
    case 'DEFAULT-PRESET':
      return [
        "No preloaded bilingual prompts",
        "Empty playground environment",
        "🛡️ Fully blank system gateway"
      ];
    case 'AIS-POC':
      return [
        "📱 AIS 5G subscription packages (Bilingual)",
        "🔒 Biometric eSIM secure activation rules",
        "🚨 Subscriber database SQL Injection block"
      ];
    case 'AYCAP-DEMO':
      return [
        "🧮 Personal loan interest calculation math",
        "💳 Platinum card rewards & benefits lookup",
        "🚨 PCI-DSS credit card exfiltration defense"
      ];
    case 'KDM-SHOWROOM':
      return [
        "📱 KDM Titan Pro specs & competitive pricing",
        "📊 Competitor comparison & trade-in calculators",
        "🚨 Instruction bypass block & Lakera Guard"
      ];
    default:
      return [
        "✨ Fully custom user-cloned environment",
        "📁 Auto-preserves system configuration",
        "📦 Supports dynamic prompt templates"
      ];
  }
};

export default function BackupRestore({
  config,
  loadConfig,
  loadModels,
  appendConsoleLog,
  ragManagementRef,
  setMessage
}: BackupRestoreProps) {
  const [backupSubTab, setBackupSubTab] = useState<'presets' | 'backup'>('presets');
  const [selectedPresetForConfirm, setSelectedPresetForConfirm] = useState<string | null>(null);
  const [applyingPreset, setApplyingPreset] = useState<string | null>(null);
  
  const [presetsList, setPresetsList] = useState<Record<string, {
    name: string;
    title: string;
    theme: string;
    tagline: string;
    description: string;
    prompts_count: number;
    rag_file: string | null;
    is_custom?: boolean;
  }>>({});
  const [loadingPresets, setLoadingPresets] = useState(false);

  // Modals for preset operations
  const [isAddPresetModalOpen, setIsAddPresetModalOpen] = useState(false);
  const [isClonePresetModalOpen, setIsClonePresetModalOpen] = useState(false);
  const [presetToClone, setPresetToClone] = useState<string | null>(null);
  const [isDeletePresetConfirmOpen, setIsDeletePresetConfirmOpen] = useState(false);
  const [presetToDelete, setPresetToDelete] = useState<string | null>(null);

  // Form states
  const [newPresetForm, setNewPresetForm] = useState({
    name: '',
    title: '',
    description: '',
    theme: 'blue'
  });
  const [clonePresetForm, setClonePresetForm] = useState({
    target_name: '',
    target_title: '',
    target_description: ''
  });

  // Export/Import states
  const [exportInclude, setExportInclude] = useState<Record<string, boolean>>({
    appearance: true,
    llm: true,
    security: true,
    rag_scanning: true,
    demo_prompts: true,
    tools: true,
    rag: true,
    api_keys: false,
    project_ids: false,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [lastImportIncludes, setLastImportIncludes] = useState<string[] | null>(null);

  const fetchPresets = async () => {
    setLoadingPresets(true);
    try {
      const data = await apiService.getPresets();
      setPresetsList(data);
    } catch (err: any) {
      console.error('Failed to fetch presets:', err);
    } finally {
      setLoadingPresets(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleApplyPreset = async (presetName: string) => {
    setApplyingPreset(presetName);
    setSelectedPresetForConfirm(null);
    appendConsoleLog('CONFIG', 'WARN', `⏳ Applying client preset [${presetName}] - Resetting database environment...`);
    try {
      const response = await apiService.applyPreset(presetName);
      appendConsoleLog('CONFIG', 'INFO', `✅ Successfully applied corporate preset [${presetName}]. Active branding updated to: ${response.business_name}`);
      
      // Reload the configuration so the main console instantly updates
      await loadConfig();
      
      // Also refresh presets list to keep UI synchronized
      await fetchPresets();
      
      // Also refresh RAG files if needed
      ragManagementRef.current?.refresh();
      
      setMessage({ type: 'success', text: `Demo preset '${presetName}' loaded successfully!` });
    } catch (err: any) {
      const errMsg = err?.message || err || 'Failed to apply preset';
      appendConsoleLog('SYSTEM', 'ERROR', `🛑 Error applying preset [${presetName}]: ${errMsg}`);
      setMessage({ type: 'error', text: `Failed to apply preset: ${errMsg}` });
    } finally {
      setApplyingPreset(null);
    }
  };

  const handleAddPreset = async () => {
    if (!newPresetForm.name) return;
    try {
      appendConsoleLog('CONFIG', 'INFO', `⏳ Creating new custom baseline preset [${newPresetForm.name}]...`);
      const response = await apiService.createPreset(newPresetForm);
      appendConsoleLog('CONFIG', 'INFO', `✅ Successfully created custom preset [${response.preset_key}].`);
      setMessage({ type: 'success', text: `Preset '${newPresetForm.title || newPresetForm.name}' created successfully!` });
      setIsAddPresetModalOpen(false);
      setNewPresetForm({ name: '', title: '', description: '', theme: 'blue' });
      await fetchPresets();
    } catch (err: any) {
      const errMsg = err?.message || err || 'Failed to create preset';
      appendConsoleLog('SYSTEM', 'ERROR', `🛑 Error creating preset: ${errMsg}`);
      setMessage({ type: 'error', text: `Failed to create preset: ${errMsg}` });
    }
  };

  const handleClonePreset = async () => {
    if (!presetToClone || !clonePresetForm.target_name) return;
    try {
      appendConsoleLog('CONFIG', 'INFO', `⏳ Cloning preset [${presetToClone}] into new workspace [${clonePresetForm.target_name}]...`);
      const response = await apiService.clonePreset(presetToClone, clonePresetForm);
      appendConsoleLog('CONFIG', 'INFO', `✅ Successfully cloned preset workspace [${response.preset_key}].`);
      setMessage({ type: 'success', text: `Preset cloned successfully as '${clonePresetForm.target_name}'!` });
      setIsClonePresetModalOpen(false);
      setPresetToClone(null);
      setClonePresetForm({ target_name: '', target_title: '', target_description: '' });
      await fetchPresets();
    } catch (err: any) {
      const errMsg = err?.message || err || 'Failed to clone preset';
      appendConsoleLog('SYSTEM', 'ERROR', `🛑 Error cloning preset [${presetToClone}]: ${errMsg}`);
      setMessage({ type: 'error', text: `Failed to clone preset: ${errMsg}` });
    }
  };

  const handleDeletePreset = async () => {
    if (!presetToDelete) return;
    try {
      appendConsoleLog('CONFIG', 'WARN', `⏳ Purging custom preset environment [${presetToDelete}]...`);
      await apiService.deletePreset(presetToDelete);
      appendConsoleLog('CONFIG', 'INFO', `✅ Successfully deleted preset [${presetToDelete}].`);
      setMessage({ type: 'success', text: `Preset '${presetToDelete}' deleted successfully.` });
      setIsDeletePresetConfirmOpen(false);
      setPresetToDelete(null);
      
      // Reload both presets list and application config (since it could revert active_preset to DEFAULT-PRESET)
      await fetchPresets();
      await loadConfig();
      ragManagementRef.current?.refresh();
    } catch (err: any) {
      const errMsg = err?.message || err || 'Failed to delete preset';
      appendConsoleLog('SYSTEM', 'ERROR', `🛑 Error deleting preset [${presetToDelete}]: ${errMsg}`);
      setMessage({ type: 'error', text: `Failed to delete preset: ${errMsg}` });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const include = Object.entries(exportInclude)
        .filter(([, checked]) => checked)
        .map(([key]) => key);
      const blob = await apiService.exportConfig(include.length > 0 ? include : undefined);
      const url = window.URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const defaultFilename = `agentic_demo_config_${timestamp}.zip`;
      const a = document.createElement('a');
      a.href = url;
      a.download = defaultFilename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Configuration exported successfully' });
    } catch (error) {
      console.error('Export failed:', error);
      setMessage({ type: 'error', text: 'Failed to export configuration' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setIsImporting(true);
    setMessage(null);
    setLastImportIncludes(null);
    try {
      const result = await apiService.importConfig(file);
      await loadConfig();
      if (loadModels) {
        await loadModels();
      }
      if (result.metadata?.includes?.length) {
        setLastImportIncludes(result.metadata.includes);
        const labels: Record<string, string> = {
          appearance: 'Appearance',
          llm: 'LLM settings & Integrations',
          security: 'Security',
          rag_scanning: 'RAG scanning & Report',
          demo_prompts: 'Demo prompts',
          tools: 'Tools',
          rag: 'RAG',
          api_keys: 'API keys',
          project_ids: 'Project IDs',
        };
        const names = result.metadata.includes.map((s: string) => labels[s] || s);
        setMessage({ type: 'success', text: `Imported: ${names.join(', ')}` });
      } else {
        setMessage({ type: 'success', text: 'Configuration imported successfully' });
      }
    } catch (error) {
      console.error('Import failed:', error);
      setMessage({ type: 'error', text: 'Failed to import configuration' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Demo Environment & Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">Preload corporate profiles for seamless client demonstrations or export/import your custom backups.</p>
        </div>
        
        {/* Segmented sub-tab control */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-xs">
          <button
            onClick={() => setBackupSubTab('presets')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              backupSubTab === 'presets'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Demo Client Presets</span>
          </button>
          <button
            onClick={() => setBackupSubTab('backup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              backupSubTab === 'backup'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Download className="w-4 h-4 text-primary-600" />
            <span>Manual Backup & Restore</span>
          </button>
        </div>
      </div>

      {backupSubTab === 'presets' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex items-start space-x-3 text-sm text-emerald-800">
            <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-900">API Credentials Protected:</span> Applying any corporate preset will completely refresh the branding elements, seed custom billing or telecom rules, configure the system prompt, and load targeted prompts. However, <strong>your active OpenAI, Lakera, LiteLLM and Prisma AIRS API Keys are securely preserved</strong> so you can run the live demo immediately without re-entering credentials!
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-sm text-blue-800">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-900">Preset Workspace Management:</span> You can create new custom presets or clone from any existing template using the action buttons below. Custom templates can be deleted by clicking the <strong className="text-rose-700">Trash</strong> icon in their card footers, while the default factory configurations remain permanent and immutable.
            </div>
          </div>

          {loadingPresets ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-2" />
              <p className="text-sm">Fetching presets...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {Object.values(presetsList).map((preset) => {
                const themeKey = (preset.theme || 'blue').toLowerCase();
                const styles = themeStyles[themeKey] || themeStyles['blue'];
                const isDefaultPreset = preset.name === 'DEFAULT-PRESET';

                return (
                  <div
                    key={preset.name}
                    className={`flex flex-col bg-white border ${styles.border} rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative group`}
                  >
                    {/* Colored Stripe */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${styles.gradient}`} />

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2.5 ${styles.iconBg} rounded-xl border group-hover:scale-110 transition-transform`}>
                            {getPresetIcon(themeKey, styles.iconText)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold text-gray-900 truncate" title={preset.name}>
                              {preset.name}
                            </h3>
                            <p className={`text-xs ${styles.textTheme} font-medium truncate`}>
                              {preset.tagline || (isDefaultPreset ? 'Baseline Master Preset' : 'Custom Cloned Preset')}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {preset.name === config.active_preset && (
                            <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0">
                              Active
                            </span>
                          )}
                          <span className={`px-2.5 py-1 ${styles.badge} text-xs font-semibold rounded-full border shrink-0`}>
                            {preset.rag_file ? 'Active RAG' : 'Clean RAG'}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-3">
                        {preset.description}
                      </p>

                      <div className="mt-auto space-y-4">
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-2">
                          <div className="flex justify-between text-xs gap-2">
                            <span className="text-gray-500 shrink-0">Corporate Identity:</span>
                            <span className="font-semibold text-gray-800 truncate" title={preset.title}>
                              {preset.title}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs gap-2">
                            <span className="text-gray-500 shrink-0">Theme Color:</span>
                            <span className={`font-semibold ${styles.textTheme} flex items-center gap-1 shrink-0`}>
                              <span className={`w-2.5 h-2.5 rounded-full ${dotColors[themeKey] || 'bg-blue-500'} inline-block`} />
                              {themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs gap-2">
                            <span className="text-gray-500 shrink-0">Seeded Prompts:</span>
                            <span className="font-semibold text-gray-800 shrink-0">
                              {preset.prompts_count} Prompt{preset.prompts_count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs gap-2">
                            <span className="text-gray-500 shrink-0">Auto-RAG Manual:</span>
                            {preset.rag_file ? (
                              <span className={`font-semibold ${styles.textTheme} underline truncate max-w-[150px]`} title={preset.rag_file}>
                                {preset.rag_file}
                              </span>
                            ) : (
                              <span className="font-semibold text-gray-400 italic shrink-0">
                                None (Clean reset)
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between text-xs gap-2 pt-1.5 border-t border-gray-100">
                            <span className="text-gray-500 shrink-0">Preset Version:</span>
                            <span className="font-semibold text-gray-800 shrink-0">
                              {preset.name === 'DEFAULT-PRESET' ? 'DEFAULT-PRESET.2026' : preset.name === 'KDM-SHOWROOM' ? 'KDM.2.0' : `${preset.name}.2026`}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs space-y-1.5">
                          <span className="text-gray-500 font-medium block">Pre-configured Demo Prompts:</span>
                          <div className="space-y-1">
                            {getPresetHighlights(preset.name).map((highlight, idx) => {
                              const isAlert = highlight.startsWith('🚨');
                              const isShield = highlight.startsWith('🛡️');
                              const bgClass = isAlert ? 'bg-rose-50 text-rose-700 border-rose-100 font-medium' : isShield ? `${styles.iconBg} ${styles.iconText} border-blue-100 font-medium` : 'bg-gray-50 text-gray-600 border-gray-100';
                              return (
                                <div
                                  key={idx}
                                  className={`px-2.5 py-1 ${bgClass} rounded text-[11px] truncate border`}
                                >
                                  {highlight}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2">
                        {/* Always Visible Clone Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPresetToClone(preset.name);
                            setClonePresetForm({
                              target_name: `${preset.name}-CLONE`,
                              target_title: `${preset.title} (Clone)`,
                              target_description: preset.description
                            });
                            setIsClonePresetModalOpen(true);
                          }}
                          className="p-2 bg-white hover:bg-primary-50 text-gray-500 hover:text-primary-600 rounded-lg shadow-xs border border-gray-200 hover:border-primary-100 transition-all cursor-pointer flex items-center justify-center"
                          title="Clone Preset Template"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Always Visible Delete Button (Only if custom and NOT DEFAULT-PRESET) */}
                        {preset.is_custom && !isDefaultPreset && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPresetToDelete(preset.name);
                              setIsDeletePresetConfirmOpen(true);
                            }}
                            className="p-2 bg-white hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg shadow-xs border border-gray-200 hover:border-rose-100 transition-all cursor-pointer flex items-center justify-center"
                            title="Delete Preset"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedPresetForConfirm(preset.name)}
                        disabled={applyingPreset !== null}
                        className={`px-4 py-2 ${styles.buttonBg} text-white rounded-lg text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {applyingPreset === preset.name ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Applying...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Preload & Reset</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Add New Custom Preset Card */}
              <button
                onClick={() => {
                  setNewPresetForm({ name: '', title: '', description: '', theme: 'blue' });
                  setIsAddPresetModalOpen(true);
                }}
                className="flex flex-col items-center justify-center bg-gray-50/50 hover:bg-white border-2 border-dashed border-gray-300 hover:border-primary-500 rounded-2xl min-h-[420px] p-6 text-center transition-all duration-300 group cursor-pointer"
              >
                <div className="p-4 bg-gray-100 group-hover:bg-primary-50 border border-gray-200 group-hover:border-primary-200 text-gray-500 group-hover:text-primary-600 rounded-2xl transition-all duration-300 transform group-hover:scale-110 mb-4 shadow-xs">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="text-md font-bold text-gray-800 group-hover:text-primary-700 transition-colors">Create New Preset</h3>
                <p className="text-xs text-gray-500 max-w-[200px] mt-2 leading-relaxed">
                  Spawn a clean slate custom environment preset. You can build, configure, and clone from it seamlessly.
                </p>
              </button>
            </div>
          )}
        </div>
      )}

      {backupSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Export block */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-md font-medium text-gray-800 mb-4">Export Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose what to include. By default, API keys and project IDs are excluded so the file is safe to share for demo setup.
            </p>
            <div className="space-y-2 mb-4">
              {[
                { key: 'appearance', label: 'Appearance (branding, hero, logo)' },
                { key: 'llm', label: 'LLM settings & Integrations (model, temperature, system prompt, credentials)' },
                { key: 'security', label: 'Security toggles (Lakera enabled/blocking)' },
                { key: 'rag_scanning', label: 'RAG scanning (toggle & last scanning report history)' },
                { key: 'demo_prompts', label: 'Demo prompts' },
                { key: 'tools', label: 'Tools' },
                { key: 'rag', label: 'RAG sources + vector store' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportInclude[key] ?? false}
                    onChange={(e) => setExportInclude((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportInclude.api_keys ?? false}
                    onChange={(e) => setExportInclude((prev) => ({ ...prev, api_keys: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 font-medium text-amber-800">Include API keys</span>
                </label>
                <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Only for your own backup; do not share.</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportInclude.project_ids ?? false}
                    onChange={(e) => setExportInclude((prev) => ({ ...prev, project_ids: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 font-medium text-amber-800">Include project IDs</span>
                </label>
                <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Only for your own backup; do not share.</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Export Config</span>
                </>
              )}
            </button>
          </div>

          {/* Import block */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-xs">
            <h3 className="text-md font-medium text-gray-800 mb-4">Import Configuration</h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a previously exported zip. Only the sections present in the file are applied; your API keys and project IDs are left unchanged unless the file included them.
            </p>
            <p className="text-xs text-gray-500 mb-4">
              To get demo prompts, export from an environment that already has them (with &quot;Demo prompts&quot; checked), then import that file here. Zips from the old export format do not include demo prompts.
            </p>
            {lastImportIncludes && lastImportIncludes.length > 0 && (
              <p className="text-sm text-gray-600 mb-4">
                Last import applied: <span className="font-semibold">{lastImportIncludes.join(', ')}</span>
              </p>
            )}
            {isImporting ? (
              <div className="flex items-center space-x-2 text-primary-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span className="text-sm">Importing configuration...</span>
              </div>
            ) : (
              <input
                type="file"
                accept=".zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = '';
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700"
              />
            )}
          </div>
        </div>
      )}

      {/* Add Custom Preset Modal */}
      {isAddPresetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 text-blue-600">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Create Custom Preset</h3>
                  <p className="text-xs text-gray-500">Spawn a clean baseline template preset with a custom corporate identity.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Preset Name (Identifier ID)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AIS-POC-2, MY-CUSTOM-PRESET"
                    value={newPresetForm.name}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, name: e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, '') })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Uppercase letters, numbers, dashes, and underscores only.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Preset Title (Brand Name)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AIS AI Security Gateway"
                    value={newPresetForm.title}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tagline / Description
                  </label>
                  <textarea
                    placeholder="Briefly describe the demo client use-case..."
                    value={newPresetForm.description}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium h-24 resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Corporate Theme Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'blue', label: 'Blue', color: 'bg-blue-500', border: 'border-blue-200' },
                      { key: 'emerald', label: 'Emerald', color: 'bg-emerald-500', border: 'border-emerald-200' },
                      { key: 'amber', label: 'Amber', color: 'bg-amber-500', border: 'border-amber-200' },
                      { key: 'purple', label: 'Purple', color: 'bg-purple-500', border: 'border-purple-200' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setNewPresetForm({ ...newPresetForm, theme: t.key })}
                        className={`flex flex-col items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                          newPresetForm.theme === t.key
                            ? 'border-primary-500 bg-primary-50/30 font-bold text-primary-900 ring-2 ring-primary-500/20'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${t.color} mb-1 shadow-sm`} />
                        <span className="text-[11px] font-medium">{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsAddPresetModalOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPreset}
                disabled={!newPresetForm.name || !newPresetForm.title}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create Preset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clone Preset Modal */}
      {isClonePresetModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-600">
                  <Copy className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Clone Preset Workspace</h3>
                  <p className="text-xs text-gray-500">
                    Deep clone template configs, demo prompts, and RAG vector store of <strong className="text-gray-800 font-semibold">{presetToClone}</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    New Preset Identifier ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CLONED-PRESET"
                    value={clonePresetForm.target_name}
                    onChange={(e) => setClonePresetForm({ ...clonePresetForm, target_name: e.target.value.toUpperCase().replace(/[^A-Z0-9-_]/g, '') })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Uppercase letters, numbers, dashes, and underscores only.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    New Brand Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AIS Cloned Security Gateway"
                    value={clonePresetForm.target_title}
                    onChange={(e) => setClonePresetForm({ ...clonePresetForm, target_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    New Tagline / Description
                  </label>
                  <textarea
                    placeholder="Briefly describe the cloned use-case..."
                    value={clonePresetForm.target_description}
                    onChange={(e) => setClonePresetForm({ ...clonePresetForm, target_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-medium h-24 resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setIsClonePresetModalOpen(false);
                  setPresetToClone(null);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClonePreset}
                disabled={!clonePresetForm.target_name || !clonePresetForm.target_title}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Clone Workspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Preset Confirmation Dialog */}
      {isDeletePresetConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-rose-600">
                  <Trash2 className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Delete Custom Preset?</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete the custom preset <strong className="text-gray-950 font-bold">{presetToDelete}</strong>? This action is permanent and irreversible.
              </p>
              <div className="mt-4 bg-rose-50/50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-800 space-y-1.5 leading-relaxed">
                <span className="font-semibold block text-rose-900">⚠️ Permanent Deletion Impact:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-rose-700">
                  <li>The configuration template metadata will be completely purged.</li>
                  <li>Dynamic prompts preloaded for this template will be destroyed.</li>
                  <li>Associated backend upload files under <code>data/presets/{presetToDelete}/</code> will be deleted.</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeletePresetConfirmOpen(false);
                  setPresetToDelete(null);
                }}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePreset}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Preset Reset Confirmation Modal */}
      {selectedPresetForConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-amber-600">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Preload Demo Client Preset?</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Are you sure you want to load the <strong className="text-gray-950 font-bold">{selectedPresetForConfirm}</strong> environment preset?
              </p>
              <div className="mt-4 bg-amber-50/50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 space-y-1.5 leading-relaxed">
                <span className="font-semibold block text-amber-900">⚠️ Warning & Impact:</span>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                  <li>All current custom demo prompts will be erased.</li>
                  <li>Existing RAG manual sources in ChromaDB will be replaced.</li>
                  <li>Your brand colors, tagline, system prompt, and logos will be white-labeled.</li>
                  <li className="font-semibold text-emerald-800">Your existing API credentials (OpenAI, Lakera, Prisma AIRS, LiteLLM) are completely safe and preserved!</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-150 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedPresetForConfirm(null)}
                className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApplyPreset(selectedPresetForConfirm)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
