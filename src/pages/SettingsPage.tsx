import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, AlertCircle, Zap, Sparkles, 
  Settings, Loader2, Globe, Shield, Activity, Server, 
  Database, X, Lock, Image as LucideImage, Download
} from 'lucide-react';
import { AppConfig } from '../types';
import { apiService } from '../services/api';

const tabIcons: Record<string, React.ComponentType<any>> = {
  setup: Activity,
  branding: LucideImage,
  llm: Globe,
  rag: Database,
  'rag-scanning': AlertCircle,
  tools: Server,
  security: Lock,
  prompts: Sparkles,
  'guardrail-testing': Shield,
  playground: Zap,
  export: Download,
};

const renderGuardRailIcon = (engineId: string, className = "w-6 h-6") => {
  switch (engineId) {
    case 'lakera':
      return (
        <svg className={`${className} text-indigo-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#lakera-grad)" stroke="none" />
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
          <path d="M9 11l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="lakera-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'prisma':
      return (
        <svg className={`${className} text-cyan-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 22,20 2,22" fill="url(#prisma-grad)" stroke="none" />
          <polygon points="12,2 22,20 2,22" stroke="currentColor" strokeWidth="2" />
          <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="1" strokeDasharray="2 2" className="opacity-80" />
          <defs>
            <linearGradient id="prisma-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'bedrock':
      return (
        <svg className={`${className} text-orange-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7v5c0 5.5 4.5 10 10 10s10-4.5 10-10V7L12 2z" fill="url(#bedrock-grad)" stroke="none" />
          <path d="M12 2L2 7v5c0 5.5 4.5 10 10 10s10-4.5 10-10V7L12 2z" stroke="currentColor" strokeWidth="2" />
          <rect x="8" y="8" width="8" height="8" rx="1" stroke="white" strokeWidth="1.5" fill="none" />
          <defs>
            <linearGradient id="bedrock-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'nemo':
      return (
        <svg className={`${className} text-emerald-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="url(#nemo-grad)" stroke="none" />
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.5" />
          <defs>
            <linearGradient id="nemo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>
      );
    default:
      return (
        <svg className={`${className} text-indigo-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
  }
};

const SettingsPage: React.FC = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [togglingEngine, setTogglingEngine] = useState<string | null>(null);

  const tabs = [
    { id: 'setup', label: 'System Flow Simulator' },
    { id: 'branding', label: 'White-Label Branding' },
    { id: 'llm', label: 'LLM Provider Gateway' },
    { id: 'rag', label: 'Knowledge Base (RAG)' },
    { id: 'rag-scanning', label: 'RAG Security Audit' },
    { id: 'tools', label: 'Agent Tool Registry' },
    { id: 'security', label: 'Guardrail Shield Policies' },
    { id: 'prompts', label: 'Preset Demo Prompts' },
    { id: 'guardrail-testing', label: 'Threat Test Lab 🛡️' },
    { id: 'playground', label: 'Interactive Chat Sandbox 🧪' },
    { id: 'export', label: 'Config Backup & Restore' },
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const configData = await apiService.getConfig();
      setConfig(configData);
    } catch (error) {
      console.error('Failed to load configuration:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration settings' });
    }
  };

  const handleToggleEngine = async (
    field: 'lakera_enabled' | 'prisma_airs_enabled' | 'bedrock_enabled' | 'nemo_enabled', 
    engineName: string
  ) => {
    if (!config) return;
    setTogglingEngine(field);
    setMessage(null);
    const updatedValue = !config[field];
    try {
      await apiService.updateConfig({ [field]: updatedValue });
      setMessage({ 
        type: 'success', 
        text: `${engineName} ${updatedValue ? 'enabled' : 'disabled'} successfully. Configure its credentials on the Guardrail Policies page.` 
      });
      await loadConfig();
    } catch (error) {
      console.error(`Failed to toggle ${field}:`, error);
      setMessage({ type: 'error', text: `Failed to update status for ${engineName}` });
    } finally {
      setTogglingEngine(null);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600" />
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Loading Settings...</p>
        </div>
      </div>
    );
  }

  const engineList = [
    {
      id: 'lakera',
      field: 'lakera_enabled' as const,
      name: 'Lakera Guard',
      description: 'Protect against prompt injections, jailbreaks, PII leaks, and moderation policy breaches using Lakera\'s ultra-fast scanner.',
      badgeColor: 'indigo',
    },
    {
      id: 'prisma',
      field: 'prisma_airs_enabled' as const,
      name: 'Prisma AIRS',
      description: 'Enforce robust corporate governance policies, protect API boundaries, and ensure compliance using Palo Alto Networks AIRS API.',
      badgeColor: 'cyan',
    },
    {
      id: 'bedrock',
      field: 'bedrock_enabled' as const,
      name: 'AWS Bedrock Guardrails',
      description: 'Apply high-reliability filters to restrict toxic, violent, sexual, or hateful content natively using Amazon\'s safety layers.',
      badgeColor: 'orange',
    },
    {
      id: 'nemo',
      field: 'nemo_enabled' as const,
      name: 'NVIDIA NeMo Guardrails',
      description: 'Maintain conversations on-topic, steer dialogue paths, and restrict banned words using programmable Colang flows.',
      badgeColor: 'emerald',
    }
  ];

  return (
    <div className="h-screen flex bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Mobile Sidebar Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Layout */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-full flex-shrink-0 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-150 bg-gray-50/50">
          <div className="flex items-center space-x-3 min-w-0">
            {config.logo_url ? (
              <img src={config.logo_url} alt="Logo" className="w-8 h-8 object-contain rounded-md" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-primary-500/10">
                SG
              </div>
            )}
            <div className="truncate">
              <h2 className="text-sm font-black text-gray-900 tracking-tight leading-none truncate">
                {config.business_name || "Shield Gateway"}
              </h2>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>
          {/* Close drawer button on mobile */}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
          {tabs.map((tab) => {
            const IconComponent = tabIcons[tab.id] || Shield;
            return (
              <Link
                key={tab.id}
                to={`/admin?tab=${tab.id}`}
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent pl-4 hover:translate-x-1"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <IconComponent className="w-4 h-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <span className="truncate">{tab.label}</span>
                </div>
              </Link>
            );
          })}
          
          <div className="pt-4 pb-1.5 px-4 border-t border-gray-100 mt-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Engine Configuration
            </span>
          </div>

          <Link
            to="/admin/settings"
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group duration-200 bg-primary-50/75 text-primary-700 font-semibold shadow-sm border-l-4 border-primary-500 pl-3.5"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <Settings className="w-4 h-4 flex-shrink-0 text-primary-600 transition-colors" />
              <span className="truncate">Settings</span>
            </div>
          </Link>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/40 space-y-3">
          <div className="inline-flex items-center w-full px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm shadow-emerald-500/5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2.5 animate-pulse" />
            <span className="truncate">Active Gateway Shield</span>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 bg-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Demo</span>
          </Link>
        </div>
      </aside>

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 h-screen bg-gray-50 overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Title / Breadcrumbs */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Admin Console
              </span>
              <span className="text-gray-300">/</span>
              <span className="text-sm font-black text-gray-900 tracking-tight capitalize">
                Settings
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
              <Activity className="w-3.5 h-3.5 mr-1.5 animate-pulse text-primary-600" />
              Live Settings
            </span>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-6 lg:p-8 scrollbar-thin">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header description */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-primary-600" />
                  System Settings
                </h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-1">
                  Enable or disable global security engines and modules
                </p>
              </div>
              <Link 
                to="/admin?tab=security"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-xl border border-primary-150 transition-colors self-start md:self-auto shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Configure Shield Policies</span>
              </Link>
            </div>

            {/* Notification alert container */}
            {message && (
              <div className={`p-4 rounded-2xl flex items-center justify-between border animate-fadeIn shadow-sm ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                  : 'bg-red-50 border-red-150 text-red-800'
              }`}>
                <div className="flex items-center space-x-3">
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  )}
                  <span className="text-sm font-semibold">{message.text}</span>
                </div>
                <button 
                  onClick={() => setMessage(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Grid layout of toggle settings */}
            <div className="grid grid-cols-1 gap-4">
              {engineList.map((engine) => {
                const isEnabled = !!config[engine.field];
                const isToggling = togglingEngine === engine.field;

                return (
                  <div 
                    key={engine.id} 
                    className="bg-white rounded-2xl border border-gray-150 shadow-sm p-6 hover:shadow-md transition-all duration-300 flex items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className={`p-3 rounded-2xl shrink-0 border ${
                        isEnabled 
                          ? `bg-${engine.badgeColor}-50 border-${engine.badgeColor}-100 text-${engine.badgeColor}-600` 
                          : 'bg-gray-50 border-gray-100 text-gray-400'
                      }`}>
                        {renderGuardRailIcon(engine.id, 'w-6 h-6')}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-extrabold text-base text-gray-900">{engine.name}</h3>
                          {isEnabled ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider animate-pulse">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-400 border border-gray-150 uppercase tracking-wider">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                          {engine.description}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <button
                        type="button"
                        disabled={isToggling}
                        onClick={() => handleToggleEngine(engine.field, engine.name)}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all focus:outline-none shadow-inner ${
                          isEnabled 
                            ? engine.id === 'lakera' ? 'bg-indigo-600' : engine.id === 'prisma' ? 'bg-cyan-600' : engine.id === 'bedrock' ? 'bg-orange-600' : 'bg-emerald-600' 
                            : 'bg-gray-200'
                        } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                      >
                        <span 
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        >
                          {isToggling && <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Policy Configuration Card */}
            <div className="bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-150 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary-600" />
                  Configure Active Engine Parameters
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Once you enable an engine above, head to the Guardrail Shield Policies panel to configure its secret keys, project identifiers, endpoints, and other active options.
                </p>
              </div>
              <Link
                to="/admin?tab=security"
                className="inline-flex items-center space-x-1 bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 font-bold text-xs transition-colors self-start sm:self-auto shadow-sm shrink-0"
              >
                <span>Shield Policies</span>
                <ArrowLeft className="w-3 h-3 rotate-180" />
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
