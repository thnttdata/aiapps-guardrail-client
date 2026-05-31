import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Settings, Key, RefreshCw, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Zap, EyeOff, Eye 
} from 'lucide-react';
import { AppConfig, AppConfigUpdate, LLMIntegration } from '../types';
import { apiService } from '../services/api';

interface LLMGatewayConfigProps {
  config: AppConfig;
  handleConfigUpdate: (updates: Partial<AppConfigUpdate>) => Promise<void>;
  availableModels: string[];
  setMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>>;
  appendConsoleLog: (
    category: 'SYSTEM' | 'CONFIG' | 'SECURITY' | 'SIMULATION' | 'SANDBOX',
    level: 'INFO' | 'WARN' | 'ERROR' | 'VIOLATION',
    message: string
  ) => void;
}

const LLMGatewayConfig: React.FC<LLMGatewayConfigProps> = ({
  config,
  handleConfigUpdate,
  availableModels,
  setMessage,
  appendConsoleLog
}) => {
  const [integrations, setIntegrations] = useState<LLMIntegration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [loadingIntegrations, setLoadingIntegrations] = useState<boolean>(true);

  // Local form states
  const [formApiKey, setFormApiKey] = useState<string>('');
  const [formApiBase, setFormApiBase] = useState<string>('');
  const [formModelName, setFormModelName] = useState<string>('');
  const [formConfigJson, setFormConfigJson] = useState<any>({});

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [saveSuccessProvider, setSaveSuccessProvider] = useState<string | null>(null);

  const loadLLMIntegrations = async (setInitialSelected = false) => {
    setLoadingIntegrations(true);
    try {
      const data = await apiService.getLLMIntegrations();
      setIntegrations(data);
      if (setInitialSelected) {
        if (config?.active_llm_provider) {
          setSelectedProvider(config.active_llm_provider);
        } else if (data.length > 0) {
          const active = data.find(i => i.enabled)?.provider || 'openai';
          setSelectedProvider(active);
        }
      }
    } catch (error) {
      console.error('Failed to load LLM integrations:', error);
      setMessage({ type: 'error', text: 'Failed to load LLM integrations' });
    } finally {
      setLoadingIntegrations(false);
    }
  };

  useEffect(() => {
    loadLLMIntegrations(true);
  }, []);

  // Synchronize local form states with selected LLM integration
  useEffect(() => {
    const currentInt = integrations.find(i => i.provider === selectedProvider);
    if (currentInt) {
      setFormApiKey(currentInt.api_key || '');
      setFormApiBase(currentInt.api_base || '');
      setFormModelName(currentInt.model_name || '');
      setFormConfigJson(currentInt.config_json || {});
    } else {
      setFormApiKey('');
      setFormApiBase('');
      setFormModelName('');
      setFormConfigJson({});
    }
    setTestResult(null);
  }, [selectedProvider, integrations]);

  const handleUpdateIntegration = async (provider: string, update: any) => {
    try {
      await apiService.updateLLMIntegration(provider, update);
      setMessage({ type: 'success', text: `${provider.replace('_', ' ').toUpperCase()} configuration saved successfully.` });
      await loadLLMIntegrations();
    } catch (error: any) {
      console.error('Failed to update integration:', error);
      setMessage({ type: 'error', text: `Failed to update integration: ${error.message || error}` });
    }
  };

  const handleSetActiveProvider = async (provider: string) => {
    try {
      await handleConfigUpdate({ active_llm_provider: provider });
      setSelectedProvider(provider);
      setMessage({ type: 'success', text: `Active LLM provider set to ${provider.toUpperCase()}` });
    } catch (error) {
      console.error('Failed to set active provider:', error);
      setMessage({ type: 'error', text: 'Failed to set active provider' });
    }
  };

  const handleTestIntegration = async (provider: string) => {
    setTestingProvider(provider);
    setTestResult(null);
    appendConsoleLog('CONFIG', 'INFO', `Testing connection for LLM provider: ${provider.toUpperCase()}`);
    try {
      const response = await apiService.testLLMIntegration(provider);
      const isSuccess = response.status === 'success';
      setTestResult({
        provider,
        success: isSuccess,
        message: response.message
      });
      if (isSuccess) {
        appendConsoleLog('CONFIG', 'INFO', `Connection test for ${provider.toUpperCase()} succeeded! Model details verified.`);
        setMessage({ type: 'success', text: `Connection test for ${provider.toUpperCase()} succeeded!` });
      } else {
        appendConsoleLog('CONFIG', 'ERROR', `Connection test for ${provider.toUpperCase()} failed: ${response.message}`);
        setMessage({ type: 'error', text: `Connection test for ${provider.toUpperCase()} failed.` });
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      setTestResult({
        provider,
        success: false,
        message: error.message || 'Network error or invalid response received.'
      });
      appendConsoleLog('CONFIG', 'ERROR', `Connection test error for ${provider.toUpperCase()}: ${error.message || 'Network timeout'}`);
      setMessage({ type: 'error', text: `Connection test for ${provider.toUpperCase()} failed.` });
    } finally {
      setTestingProvider(null);
    }
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const formApiBaseValue = formApiBase;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500 animate-pulse" />
            Dynamic LLM Routing Setup
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Toggle, configure, and hot-swap LLM providers dynamically. All application prompts and chat agents route instantly to your chosen active provider.
          </p>
        </div>
        {config?.active_llm_provider && (
          <div className="mt-3 md:mt-0 flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Active Routing: {config.active_llm_provider.toUpperCase()}
          </div>
        )}
      </div>

      {/* Provider Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            id: 'openai',
            name: 'OpenAI',
            desc: 'Standard GPT-4o models & API integration.',
            gradient: 'from-emerald-500 to-teal-600',
            color: 'emerald'
          },
          {
            id: 'claude',
            name: 'Anthropic Claude',
            desc: 'State-of-the-art reasoning and agent capabilities.',
            gradient: 'from-amber-500 to-orange-600',
            color: 'amber'
          },
          {
            id: 'minimax',
            name: 'Minimax AI',
            desc: 'High-speed, dual-engine reasoning chat models.',
            gradient: 'from-indigo-500 to-purple-600',
            color: 'indigo'
          },
          {
            id: 'vertex_ai',
            name: 'Google Vertex AI',
            desc: 'Enterprise Gemini models with top-tier security.',
            gradient: 'from-blue-500 to-cyan-600',
            color: 'blue'
          },
          {
            id: 'gemini',
            name: 'Google AI Studio (Gemini)',
            desc: 'Developer API using direct personal API keys.',
            gradient: 'from-blue-600 to-indigo-600',
            color: 'blue'
          },
          {
            id: 'ai_gateway',
            name: 'AI Gateway (LiteLLM, Kong, PortKey)',
            desc: 'Enterprise gateway routing for LiteLLM, Kong, and PortKey proxies.',
            gradient: 'from-purple-500 to-indigo-600',
            color: 'purple'
          }
        ].map((prov) => {
          const intg = integrations.find(i => i.provider === prov.id);
          const isSelected = selectedProvider === prov.id;
          const isActive = config?.active_llm_provider === prov.id;

          return (
            <button
              key={prov.id}
              onClick={() => setSelectedProvider(prov.id)}
              className={`relative flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none ${
                isSelected
                  ? `border-${prov.color}-500 bg-white ring-2 ring-${prov.color}-100 shadow-md`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {isActive && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1 shadow-sm z-10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              
              {prov.id === 'ai_gateway' ? (
                <div className="h-10 flex items-center gap-1.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-[10px] font-bold shadow-sm border border-gray-100 hover:scale-110 transition-transform duration-200" title="LiteLLM">
                    <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-none stroke-white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 5v10a2 2 0 0 0 2 2h6" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#F97316] flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200" title="Kong Gateway">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center shadow-sm hover:scale-110 transition-transform duration-200" title="Portkey">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-amber-400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="9" r="3" />
                      <path d="M12 12v6l2-1.5" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prov.gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm mb-4`}>
                  {prov.id === 'openai' && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21.3 10.1a2.8 2.8 0 0 0-.1-1.6 2.8 2.8 0 0 0-2.1-1.9c-.3 0-.6 0-.9.1a3 3 0 0 0-1.2-1.4 3 3 0 0 0-3.1.2c-.2.1-.4.3-.6.5a2.8 2.8 0 0 0-2.6-1.5c-1.1 0-2.1.6-2.6 1.6-.2.1-.3.2-.4.4a2.9 2.9 0 0 0-1.7-.1c-1.1.2-2 .9-2.4 1.9a2.9 2.9 0 0 0-.2 1.3 3 3 0 0 0-.6 1.4A2.9 2.9 0 0 0 4 12c.2 1.1.9 2 1.9 2.4.1.1.3.1.4.2a2.8 2.8 0 0 0 .4 1.1 2.9 2.9 0 0 0 2.7 1.5c.3 0 .6 0 .9-.1a3 3 0 0 0 1.1 1.4 3 3 0 0 0 3.7-.4c.2-.2.4-.4.5-.6a2.8 2.8 0 0 0 1.7.2 2.9 2.9 0 0 0 2.4-1.8c.2-.4.2-.9.2-1.3a3 3 0 0 0 .6-1.4c.1-.5-.1-1.6-.6-2.5zm-8.5 10c-.5.3-1.1.3-1.6.1l-3.3-1.9c-.2-.1-.3-.3-.3-.5v-3.8l3.3 1.9c.2.1.4.2.6.2.2 0 .4-.1.6-.2l3.3-1.9v3.8c0 .2-.1.4-.3.5l-3.3 1.9zm-5.8-3.3a2.5 2.5 0 0 1-.9-1.4c0-.2 0-.4.1-.6l3.3-1.9v3.8c0 .2-.1.4-.3.5l-3.3 1.9c-.1-.1-.1-.2.1-.3zm-.9-6.7c.1-.6.5-1.1 1-1.4.2-.1.4-.1.6-.1l3.3 1.9V14c0 .2-.1.4-.3.5l-3.3 1.9-1.3-3.8zm5.1 1.4L7.9 9.6l3.3-1.9c.5-.3 1.1-.3 1.6 0l3.3 1.9-3.3 1.9c-.5.3-1.1.3-1.6 0zm1.9-1.4l3.3-1.9c.2-.1.4-.1.6-.1.5.3.9.8.9 1.4v3.8l-3.3-1.9c-.2-.1-.3-.3-.3-.5V10.1zm3.8 4.9c.5.3.8.8.9 1.4 0 .2 0 .4-.1.6l-3.3 1.9v-3.8c0-.2.1-.4.3-.5l3.3-1.9c.1 0 .1.1-.1.3z" />
                    </svg>
                  )}
                  {prov.id === 'claude' && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.1 19.3h-2.1l-1.3-3.8H8.3l-1.3 3.8H4.9L10.7 4.7h2.6l5.8 14.6zM14.9 13.1l-2.9-8.4-2.9 8.4h5.8z" />
                    </svg>
                  )}
                  {prov.id === 'minimax' && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 12c0-3.3 2.7-6 6-6s6 6 10 6" />
                      <path d="M20 12c0 3.3-2.7 6-6 6s-6-6-10-6" />
                      <circle cx="10" cy="12" r="1.5" fill="currentColor" />
                      <circle cx="14" cy="12" r="1.5" fill="currentColor" />
                    </svg>
                  )}
                  {prov.id === 'vertex_ai' && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22L3 17V7L12 12V22Z" fill="#4285F4" />
                      <path d="M12 22L21 17V7L12 12V22Z" fill="#34A853" />
                      <path d="M12 12L3 7L12 2L21 7L12 12Z" fill="#EA4335" />
                      <path d="M12 12V2" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                      <path d="M12 12L3 7" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                      <path d="M12 12L21 7" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  )}
                  {prov.id === 'gemini' && (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white animate-pulse" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill="currentColor" d="M12,3C12,7.97 7.97,12 3,12C7.97,12 12,16.03 12,21C12,16.03 16.03,12 21,12C16.03,12 12,7.97 12,3Z" />
                      <path fill="currentColor" d="M19,3C19,5.21 17.21,7 15,7C17.21,7 19,8.79 19,11C19,8.79 20.79,7 23,7C20.79,7 19,5.21 19,3Z" className="opacity-80" />
                    </svg>
                  )}
                </div>
              )}

              <h3 className="text-sm font-bold text-gray-900 mb-1">{prov.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{prov.desc}</p>
              
              <div className="mt-auto pt-3 flex items-center justify-between w-full">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  intg?.enabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {intg?.enabled ? 'Configured' : 'Inactive'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Loader indicator for integrations loading */}
      {loadingIntegrations ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm text-gray-500 mt-2 font-medium">Loading LLM configs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dynamic Settings Form Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                    <Settings className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-md font-bold text-gray-900">
                      {selectedProvider.replace('_', ' ').toUpperCase()} Configuration
                    </h3>
                    <p className="text-xs text-gray-400">Manage credentials, API endpoints, and model routing.</p>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={integrations.find(i => i.provider === selectedProvider)?.enabled ?? false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      handleUpdateIntegration(selectedProvider, { enabled: checked });
                    }}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  <span className="ml-2 text-xs font-semibold text-gray-600">
                    {integrations.find(i => i.provider === selectedProvider)?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              {/* Fields layout */}
              <div className="space-y-4">
                {/* API API Key Input for OpenAI, Claude, Minimax, Gateway */}
                {selectedProvider !== 'vertex_ai' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>API Access Key</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {selectedProvider === 'ai_gateway' ? 'Optional / Gateway Dependent' : 'Required'}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <Key className="h-4 w-4 text-gray-400" />
                      </span>
                      <input
                        type={showApiKeys[selectedProvider] ? 'text' : 'password'}
                        value={formApiKey}
                        onChange={(e) => setFormApiKey(e.target.value)}
                        placeholder={
                          selectedProvider === 'claude' ? 'sk-ant-api03-...' : 
                          selectedProvider === 'minimax' ? 'Minimax API key' : 
                          selectedProvider === 'gemini' ? 'AIzaSy...' : 
                          selectedProvider === 'ai_gateway' ? 'Enter gateway access key / token' : 'sk-proj-...'
                        }
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-gray-50/50"
                      />
                      <button
                        type="button"
                        onClick={() => toggleApiKeyVisibility(selectedProvider)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKeys[selectedProvider] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Specific inputs for Minimax */}
                {selectedProvider === 'minimax' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Minimax Group ID
                    </label>
                    <input
                      type="text"
                      value={formConfigJson.group_id || ''}
                      onChange={(e) => setFormConfigJson((prev: any) => ({ ...prev, group_id: e.target.value }))}
                      placeholder="e.g. 1234567890"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Minimax APIs require a unique Group ID alongside your API secret.</p>
                  </div>
                )}

                {/* Specific inputs for Vertex AI */}
                {selectedProvider === 'vertex_ai' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        GCP Service Account Credentials JSON
                      </label>
                      <div className="relative">
                        <textarea
                          value={typeof formConfigJson.credentials_json === 'object' ? JSON.stringify(formConfigJson.credentials_json, null, 2) : formConfigJson.credentials_json || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormConfigJson((prev: any) => ({ ...prev, credentials_json: val }));
                          }}
                          rows={5}
                          placeholder={`{\n  "type": "service_account",\n  "project_id": "your-gcp-project",\n  "private_key_id": "...",\n  "private_key": "-----BEGIN PRIVATE KEY-----\\n...",\n  "client_email": "..."\n}`}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs font-mono bg-gray-50/50"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Provide service account credentials with Vertex AI User role access.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          GCP Project ID
                        </label>
                        <input
                          type="text"
                          value={formConfigJson.project_id || ''}
                          onChange={(e) => setFormConfigJson((prev: any) => ({ ...prev, project_id: e.target.value }))}
                          placeholder="your-gcp-project"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                          GCP Location / Region
                        </label>
                        <input
                          type="text"
                          value={formConfigJson.location || ''}
                          onChange={(e) => setFormConfigJson((prev: any) => ({ ...prev, location: e.target.value }))}
                          placeholder="us-central1"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* API Base URL for custom proxy / gateways */}
                {selectedProvider !== 'vertex_ai' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Custom API Base URL</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {selectedProvider === 'ai_gateway' ? 'Required' : 'Optional'}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={formApiBaseValue}
                      onChange={(e) => setFormApiBase(e.target.value)}
                      placeholder={
                        selectedProvider === 'openai' ? 'e.g. https://api.openai.com/v1 or custom proxy' :
                        selectedProvider === 'claude' ? 'e.g. https://api.anthropic.com/v1' : 
                        selectedProvider === 'gemini' ? 'e.g. https://generativelanguage.googleapis.com' : 
                        selectedProvider === 'ai_gateway' ? 'e.g. http://localhost:4000/v1 or custom proxy' : 'e.g. https://api.minimax.chat/v1'
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                    />
                  </div>
                )}

                {/* Model Configuration Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Target Routing Model
                    </label>
                    {/* Fallback support: user can choose dropdown or write custom */}
                    <div className="space-y-2">
                      <select
                        value={formModelName}
                        onChange={(e) => setFormModelName(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50"
                      >
                        <option value="">-- Choose or Enter Custom Model --</option>
                        {selectedProvider === 'openai' && (
                          <>
                            <option value="gpt-4o">gpt-4o (Recommended)</option>
                            <option value="gpt-4o-mini">gpt-4o-mini</option>
                            <option value="gpt-4">gpt-4</option>
                            <option value="o1-mini">o1-mini</option>
                          </>
                        )}
                        {selectedProvider === 'claude' && (
                          <>
                            <option value="claude-3-5-sonnet-20241022">claude-3-5-sonnet-20241022 (Recommended)</option>
                            <option value="claude-3-5-haiku-20241022">claude-3-5-haiku-20241022</option>
                            <option value="claude-3-opus-20240229">claude-3-opus-20240229</option>
                          </>
                        )}
                        {selectedProvider === 'minimax' && (
                          <>
                            <option value="abab6.5g-chat">abab6.5g-chat (Recommended)</option>
                            <option value="abab6.5-chat">abab6.5-chat</option>
                          </>
                        )}
                        {selectedProvider === 'vertex_ai' && (
                          <>
                            <option value="gemini-1.5-pro-preview-0409">gemini-1.5-pro-preview-0409 (Recommended)</option>
                            <option value="gemini-1.5-flash-preview-0409">gemini-1.5-flash-preview-0409</option>
                            <option value="gemini-1.0-pro">gemini-1.0-pro</option>
                          </>
                        )}
                        {selectedProvider === 'gemini' && (
                          <>
                            <option value="gemini-1.5-flash">gemini-1.5-flash (Recommended)</option>
                            <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                            <option value="gemini-2.0-flash-exp">gemini-2.0-flash-exp</option>
                            <option value="gemini-2.0-pro-exp">gemini-2.0-pro-exp</option>
                            <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                            <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                            <option value="gemini-3.0-flash">gemini-3.0-flash</option>
                            <option value="gemini-3.0-pro">gemini-3.0-pro</option>
                            <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                            <option value="gemini-3.5-pro">gemini-3.5-pro</option>
                            <option value="gemini-1.0-pro">gemini-1.0-pro</option>
                          </>
                        )}
                        {selectedProvider === 'ai_gateway' && (
                          <>
                            <option value="gpt-4o-mini">gpt-4o-mini (Recommended)</option>
                            <option value="gpt-4o">gpt-4o</option>
                            <option value="llama3">llama3</option>
                            <option value="mistral">mistral</option>
                            <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                          </>
                        )}
                        {availableModels.length > 0 && (
                          <optgroup label="Models from API">
                            {availableModels.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      <input
                        type="text"
                        value={formModelName}
                        onChange={(e) => setFormModelName(e.target.value)}
                        placeholder="Enter custom model identifier"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs bg-gray-50/50 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Global Temperature
                    </label>
                    <div className="px-3 py-2 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center justify-between gap-4">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={config?.temperature ?? 7}
                        onChange={(e) => handleConfigUpdate({ temperature: parseInt(e.target.value) })}
                        className="flex-1 accent-primary-600 h-1 bg-gray-200 rounded-lg cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-600 w-6 text-right">{(config?.temperature ?? 7) / 10}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Adjust creativity: lower values are precise, higher values creative.</p>
                  </div>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => handleTestIntegration(selectedProvider)}
                  disabled={testingProvider === selectedProvider}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 hover:bg-gray-100 disabled:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 hover:shadow-sm"
                >
                  {testingProvider === selectedProvider ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
                      Testing connection...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                      Test Connection
                    </>
                  )}
                </button>

                 <div className="flex items-center gap-3">
                  {saveSuccessProvider === selectedProvider && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-bounce" />
                      Saved Successfully!
                    </span>
                  )}
                  {savingProvider === selectedProvider && (
                    <span className="text-xs font-semibold text-gray-500 flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                      Saving...
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={savingProvider === selectedProvider}
                    onClick={async () => {
                      setSavingProvider(selectedProvider);
                      setSaveSuccessProvider(null);
                      let formattedConfig = formConfigJson;
                      if (selectedProvider === 'vertex_ai' && typeof formConfigJson.credentials_json === 'string') {
                        try {
                          formattedConfig = {
                            ...formConfigJson,
                            credentials_json: JSON.parse(formConfigJson.credentials_json)
                          };
                        } catch (e) {
                          // Keep as string if it's invalid JSON, backend will report error
                        }
                      }
                      try {
                        await handleUpdateIntegration(selectedProvider, {
                          api_key: formApiKey === '' ? null : formApiKey,
                          api_base: formApiBase === '' ? null : formApiBase,
                          model_name: formModelName === '' ? null : formModelName,
                          config_json: formattedConfig
                        });
                        setSaveSuccessProvider(selectedProvider);
                        setTimeout(() => {
                          setSaveSuccessProvider(null);
                        }, 3000);
                      } catch (e) {
                        // Error handled inside handleUpdateIntegration
                      } finally {
                        setSavingProvider(null);
                      }
                    }}
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md flex items-center gap-1.5"
                  >
                    Save Provider Config
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Panel for Quick Actions */}
          <div className="space-y-6">
            {/* Routing Status Card */}
            <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-850 text-white rounded-2xl shadow-lg border border-gray-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
              
              <h4 className="text-sm font-bold tracking-wide uppercase text-gray-300 flex items-center gap-1.5 mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Routing Engine
              </h4>

              <div className="space-y-4 relative z-10">
                <div>
                  <p className="text-[11px] text-gray-400 font-medium">Currently Selected Active Provider</p>
                  <p className="text-lg font-black text-white mt-0.5 tracking-tight flex items-center gap-2">
                    {config?.active_llm_provider?.toUpperCase() || 'OPENAI'}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </p>
                </div>

                {selectedProvider !== config?.active_llm_provider && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                      You are viewing {selectedProvider.toUpperCase()} configurations. Would you like to switch active traffic routing to this provider?
                    </p>
                    <button
                      type="button"
                      onClick={() => handleSetActiveProvider(selectedProvider)}
                      disabled={!integrations.find(i => i.provider === selectedProvider)?.enabled}
                      className="w-full py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Activate {selectedProvider.replace('_', ' ').toUpperCase()} Routing
                    </button>
                    {!integrations.find(i => i.provider === selectedProvider)?.enabled && (
                      <p className="text-[10px] text-rose-300 mt-1 text-center font-medium">Must configure and enable provider first.</p>
                    )}
                  </div>
                )}

                {selectedProvider === config?.active_llm_provider && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Live Traffic Routing Enabled</p>
                      <p className="text-[10px] text-emerald-400/80 mt-0.5 leading-relaxed">All incoming completions and RAG prompts are now handled by {selectedProvider.toUpperCase()}.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Test Results Dashboard Card */}
            {testResult && testResult.provider === selectedProvider && (
              <div className={`p-5 rounded-2xl border shadow-sm space-y-3 transition-all duration-300 ${
                testResult.success 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50/50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Test Connection Successful
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Test Connection Failed
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed font-medium font-mono whitespace-pre-wrap bg-white/70 p-3 rounded-xl border border-gray-100 max-h-48 overflow-y-auto">
                  {testResult.message}
                </p>
              </div>
            )}

            {/* Tips and docs */}
            <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
              <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-gray-500" />
                Credentials Info
              </h5>
              <p className="text-xs text-gray-500 leading-relaxed">
                API keys are safely hashed and stored locally in the secure database. At runtime, the server utilizes local REST calls directly to avoid heavy global SDK locks or cold starts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global system prompt configuration card */}
      <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Settings className="w-4 h-4 text-gray-500" />
          <h3 className="text-sm font-bold text-gray-900">System Instruction Override</h3>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Global System Persona / Guardrail Prompt
          </label>
          <textarea
            value={config?.system_prompt || ''}
            onChange={(e) => handleConfigUpdate({ system_prompt: e.target.value })}
            rows={4}
            placeholder="Enter instructions that define the assistant's behavior, tone, and guardrails..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-gray-50/50 leading-relaxed font-sans"
          />
          <p className="text-[11px] text-gray-400 mt-1">This context prepends all conversations before reaching the active router.</p>
        </div>
      </div>
    </div>
  );
};

export default LLMGatewayConfig;
