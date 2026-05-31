import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Settings, Key, EyeOff, Eye, Activity, Globe, Server, Loader2, Check
} from 'lucide-react';
import { AppConfig, AppConfigUpdate } from '../types';

interface GuardrailShieldPoliciesProps {
  config: AppConfig;
  handleConfigUpdate: (updates: Partial<AppConfigUpdate>) => Promise<void>;
  setMessage: (message: { type: 'success' | 'error'; text: string } | null) => void;
}

export default function GuardrailShieldPolicies({
  config,
  handleConfigUpdate,
  setMessage
}: GuardrailShieldPoliciesProps) {
  const [lakeraKey, setLakeraKey] = useState('');
  const [lakeraProjectId, setLakeraProjectId] = useState('');
  const [ragLakeraProjectId, setRagLakeraProjectId] = useState('');
  const [showLakeraKey, setShowLakeraKey] = useState(false);
  const [isSavingLakera, setIsSavingLakera] = useState(false);

  const [prismaKey, setPrismaKey] = useState('');
  const [prismaBase, setPrismaBase] = useState('');
  const [prismaProfile, setPrismaProfile] = useState('');
  const [showPrismaKey, setShowPrismaKey] = useState(false);
  const [isSavingPrisma, setIsSavingPrisma] = useState(false);

  const [bedrockAccessKey, setBedrockAccessKey] = useState('');
  const [bedrockSecretKey, setBedrockSecretKey] = useState('');
  const [bedrockRegion, setBedrockRegion] = useState('');
  const [bedrockGuardrailId, setBedrockGuardrailId] = useState('');
  const [bedrockGuardrailVersion, setBedrockGuardrailVersion] = useState('');
  const [showBedrockSecretKey, setShowBedrockSecretKey] = useState(false);
  const [isSavingBedrock, setIsSavingBedrock] = useState(false);

  const [nemoKey, setNemoKey] = useState('');
  const [nemoBase, setNemoBase] = useState('');
  const [nemoProfile, setNemoProfile] = useState('');
  const [showNemoKey, setShowNemoKey] = useState(false);
  const [isSavingNemo, setIsSavingNemo] = useState(false);

  const [showLitellmVirtualKey, setShowLitellmVirtualKey] = useState(false);

  // Sync state with config prop when config is loaded or changed
  useEffect(() => {
    if (config) {
      setLakeraKey(config.lakera_api_key || '');
      setLakeraProjectId(config.lakera_project_id || '');
      setRagLakeraProjectId(config.rag_lakera_project_id || '');

      setPrismaKey(config.prisma_airs_api_key || '');
      setPrismaBase(config.prisma_airs_api_base || '');
      setPrismaProfile(config.prisma_airs_profile_name || '');

      setBedrockAccessKey(config.bedrock_access_key_id || '');
      setBedrockSecretKey(config.bedrock_secret_access_key || '');
      setBedrockRegion(config.bedrock_region || '');
      setBedrockGuardrailId(config.bedrock_guardrail_id || '');
      setBedrockGuardrailVersion(config.bedrock_guardrail_version || '');

      setNemoKey(config.nemo_api_key || '');
      setNemoBase(config.nemo_api_base || '');
      setNemoProfile(config.nemo_config_profile || '');
    }
  }, [config]);

  const handleSaveLakeraConfig = async () => {
    setIsSavingLakera(true);
    try {
      await handleConfigUpdate({
        lakera_api_key: lakeraKey,
        lakera_project_id: lakeraProjectId,
        rag_lakera_project_id: ragLakeraProjectId,
      });
      setMessage({ type: 'success', text: 'Lakera Guard credentials updated successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update Lakera Guard credentials.' });
    } finally {
      setIsSavingLakera(false);
    }
  };

  const handleSavePrismaConfig = async () => {
    setIsSavingPrisma(true);
    try {
      await handleConfigUpdate({
        prisma_airs_api_key: prismaKey,
        prisma_airs_api_base: prismaBase,
        prisma_airs_profile_name: prismaProfile,
      });
      setMessage({ type: 'success', text: 'Prisma AIRS credentials updated successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update Prisma AIRS credentials.' });
    } finally {
      setIsSavingPrisma(false);
    }
  };

  const handleSaveBedrockConfig = async () => {
    setIsSavingBedrock(true);
    try {
      await handleConfigUpdate({
        bedrock_access_key_id: bedrockAccessKey,
        bedrock_secret_access_key: bedrockSecretKey,
        bedrock_region: bedrockRegion,
        bedrock_guardrail_id: bedrockGuardrailId,
        bedrock_guardrail_version: bedrockGuardrailVersion,
      });
      setMessage({ type: 'success', text: 'AWS Bedrock credentials updated successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update AWS Bedrock credentials.' });
    } finally {
      setIsSavingBedrock(false);
    }
  };

  const handleSaveNemoConfig = async () => {
    setIsSavingNemo(true);
    try {
      await handleConfigUpdate({
        nemo_api_key: nemoKey,
        nemo_api_base: nemoBase,
        nemo_config_profile: nemoProfile,
      });
      setMessage({ type: 'success', text: 'NVIDIA NeMo credentials updated successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update NVIDIA NeMo credentials.' });
    } finally {
      setIsSavingNemo(false);
    }
  };

  const anyEngineEnabled = config.lakera_enabled || config.prisma_airs_enabled || config.bedrock_enabled || config.nemo_enabled;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Security Configuration</h2>
        <p className="text-xs text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">Configure, Enable, or Disable Guardrail Security Policies</p>
      </div>

      {!anyEngineEnabled ? (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/80 via-slate-900/90 to-slate-950/95 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl animate-fadeIn">
          {/* Decorative glowing background blobs */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10 max-w-md mx-auto space-y-6 py-6">
            <div className="inline-flex items-center justify-center p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-slate-400 shadow-inner mb-2 animate-bounce">
              <Shield className="w-10 h-10 text-indigo-400 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                No Guardrail Engines Active
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your Gateway Shield is currently running in bypass mode. Activate one or more safety engines (Lakera, Prisma, AWS Bedrock, NeMo) to enable inline content filtering and real-time threat neutralization.
              </p>
            </div>

            <Link
              to="/admin/settings"
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 hover:scale-[1.02]"
            >
              <Settings className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Open System Settings</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Lakera Guard Card */}
          {config.lakera_enabled && (
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300 animate-fadeIn">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                    <Shield className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Lakera Guard</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Fast Threat Scan</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 font-medium">
                Protect against prompt injections, jailbreaks, PII leaks, and moderation policy breaches using Lakera's ultra-fast scanner.
              </p>
              <div className="bg-slate-50/80 border border-gray-100 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-800">Blocking Mode</label>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Block flagged queries instead of logging</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate({ lakera_blocking_mode: !config.lakera_blocking_mode })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      config.lakera_blocking_mode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${config.lakera_blocking_mode ? 'translate-x-4.5' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-2.5 border-t border-gray-150">
                  <div>
                    <label className="text-xs font-bold text-gray-800">RAG Content Scanning</label>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Scan ingested document chunks dynamically</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate({ rag_content_scanning: !config.rag_content_scanning })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      config.rag_content_scanning ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${config.rag_content_scanning ? 'translate-x-4.5' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Credentials Segment */}
                <div className="pt-2.5 border-t border-gray-150">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Engine Credentials</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        Lakera API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showLakeraKey ? "text" : "password"}
                          value={lakeraKey}
                          onChange={(e) => setLakeraKey(e.target.value)}
                          placeholder="Enter Lakera API Key (lk_...)"
                          className="w-full px-3 py-1.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLakeraKey(!showLakeraKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showLakeraKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        Lakera Project ID
                      </label>
                      <input
                        type="text"
                        value={lakeraProjectId}
                        onChange={(e) => setLakeraProjectId(e.target.value)}
                        placeholder="Enter Lakera Project ID"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                      />
                    </div>

                    {config.rag_content_scanning && (
                      <div className="animate-fadeIn">
                        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          RAG Scanning Project ID
                        </label>
                        <input
                          type="text"
                          value={ragLakeraProjectId}
                          onChange={(e) => setRagLakeraProjectId(e.target.value)}
                          placeholder="Enter RAG Scanning Project ID (e.g. project-8541012967)"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                        />
                        <p className="text-[9px] text-gray-400 mt-1 font-bold">
                          Dedicated Lakera project ID used exclusively for RAG content scanning.
                        </p>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isSavingLakera}
                      onClick={handleSaveLakeraConfig}
                      className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSavingLakera ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Apply Configuration</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Prisma AIRS Card */}
          {config.prisma_airs_enabled && (
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-300 animate-fadeIn">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-100 text-cyan-600">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-gray-900">Prisma AIRS</h3>
                      {config.prisma_airs_env_configured ? (
                        <span className="text-[8px] font-black tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase">Connected</span>
                      ) : (
                        <span className="text-[8px] font-black tracking-widest bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-md uppercase">Missing Key</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">AI Safety Policy</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 font-medium">
                Enforce robust corporate governance policies, protect API boundaries, and ensure compliance using Palo Alto Networks AIRS API.
              </p>
              <div className="bg-slate-50/80 border border-gray-100 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-800">Blocking Mode</label>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Hard-block interactions flagged by Prisma policies</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate({ prisma_airs_blocking_mode: !config.prisma_airs_blocking_mode })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      config.prisma_airs_blocking_mode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${config.prisma_airs_blocking_mode ? 'translate-x-4.5' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Credentials Segment */}
                <div className="pt-2.5 border-t border-gray-150">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Key className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Engine Credentials</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        Prisma AIRS API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showPrismaKey ? "text" : "password"}
                          value={prismaKey}
                          onChange={(e) => setPrismaKey(e.target.value)}
                          placeholder="Enter Prisma AIRS API Key"
                          className="w-full px-3 py-1.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPrismaKey(!showPrismaKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPrismaKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        API Base URL
                      </label>
                      <input
                        type="text"
                        value={prismaBase}
                        onChange={(e) => setPrismaBase(e.target.value)}
                        placeholder="e.g. https://api.prisma.paloaltonetworks.com"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        Security Profile Name
                      </label>
                      <input
                        type="text"
                        value={prismaProfile}
                        onChange={(e) => setPrismaProfile(e.target.value)}
                        placeholder="e.g. default-security-profile"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs font-semibold"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isSavingPrisma}
                      onClick={handleSavePrismaConfig}
                      className="w-full flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSavingPrisma ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Apply Configuration</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. AWS Bedrock Card */}
          {config.bedrock_enabled && (
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 animate-fadeIn">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-50 border border-orange-100 text-orange-600">
                    <Globe className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">AWS Bedrock</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Content Safety</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 font-medium">
                Apply high-reliability filters to restrict toxic, violent, sexual, or hateful content natively using Amazon's safety layers.
              </p>
              <div className="bg-slate-50/80 border border-gray-100 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-800">Blocking Mode</label>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Block conversations violating Bedrock safety thresholds</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate({ bedrock_blocking_mode: !config.bedrock_blocking_mode })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      config.bedrock_blocking_mode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${config.bedrock_blocking_mode ? 'translate-x-4.5' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Credentials Segment */}
                <div className="pt-2.5 border-t border-gray-150">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Key className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Engine Credentials</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        AWS Access Key ID
                      </label>
                      <input
                        type="text"
                        value={bedrockAccessKey}
                        onChange={(e) => setBedrockAccessKey(e.target.value)}
                        placeholder="AKIA..."
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        AWS Secret Access Key
                      </label>
                      <div className="relative">
                        <input
                          type={showBedrockSecretKey ? "text" : "password"}
                          value={bedrockSecretKey}
                          onChange={(e) => setBedrockSecretKey(e.target.value)}
                          placeholder="Enter AWS Secret Access Key"
                          className="w-full px-3 py-1.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowBedrockSecretKey(!showBedrockSecretKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showBedrockSecretKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          AWS Region
                        </label>
                        <input
                          type="text"
                          value={bedrockRegion}
                          onChange={(e) => setBedrockRegion(e.target.value)}
                          placeholder="us-east-1"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                          Guardrail Version
                        </label>
                        <input
                          type="text"
                          value={bedrockGuardrailVersion}
                          onChange={(e) => setBedrockGuardrailVersion(e.target.value)}
                          placeholder="DRAFT or 1"
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        Bedrock Guardrail ID
                      </label>
                      <input
                        type="text"
                        value={bedrockGuardrailId}
                        onChange={(e) => setBedrockGuardrailId(e.target.value)}
                        placeholder="e.g. a1b2c3d4e5"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isSavingBedrock}
                      onClick={handleSaveBedrockConfig}
                      className="w-full flex items-center justify-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSavingBedrock ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Apply Configuration</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. NVIDIA NeMo Card */}
          {config.nemo_enabled && (
            <div className="bg-white rounded-2xl border border-gray-150 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 animate-fadeIn">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                    <Server className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">NeMo Guardrails</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Dialogue Flows</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4 font-medium">
                Maintain conversations on-topic, steer dialogue paths, and restrict banned words using programmable Colang flows.
              </p>
              <div className="bg-slate-50/80 border border-gray-100 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-800">Blocking Mode</label>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Strictly redirect off-topic or toxic dialog interactions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate({ nemo_blocking_mode: !config.nemo_blocking_mode })}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      config.nemo_blocking_mode ? 'bg-red-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${config.nemo_blocking_mode ? 'translate-x-4.5' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Credentials Segment */}
                <div className="pt-2.5 border-t border-gray-150">
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Key className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Engine Credentials</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        NeMo API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showNemoKey ? "text" : "password"}
                          value={nemoKey}
                          onChange={(e) => setNemoKey(e.target.value)}
                          placeholder="Enter NeMo API Key"
                          className="w-full px-3 py-1.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNemoKey(!showNemoKey)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showNemoKey ? <EyeOff className="h-3.5 h-3.5" /> : <Eye className="h-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        NeMo Server Base URL
                      </label>
                      <input
                        type="text"
                        value={nemoBase}
                        onChange={(e) => setNemoBase(e.target.value)}
                        placeholder="e.g. http://localhost:8000"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                        Config Profile
                      </label>
                      <input
                        type="text"
                        value={nemoProfile}
                        onChange={(e) => setNemoProfile(e.target.value)}
                        placeholder="e.g. default"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                      />
                    </div>

                    <button
                      type="button"
                      disabled={isSavingNemo}
                      onClick={handleSaveNemoConfig}
                      className="w-full flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50 shadow-sm"
                    >
                      {isSavingNemo ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      <span>Apply Configuration</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Global API & Proxy Integrations */}
      <div className="border-t border-gray-150 pt-6">
        <h3 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
          <Settings className="w-4 h-4 text-indigo-500" />
          Global API & Proxy Integrations
        </h3>
        
        <div className="space-y-6">
          {/* LiteLLM Proxy Toggle */}
          <div className="flex items-center space-x-3 bg-white border border-gray-150 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
            <button
              type="button"
              onClick={() => handleConfigUpdate({ use_litellm: !(config.use_litellm ?? false) })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                config.use_litellm ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(config.use_litellm ?? false) ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <div>
              <label className="text-sm font-bold text-gray-800">
                Use LiteLLM proxy
              </label>
              <p className="text-xs text-gray-500 font-semibold">
                Route LLM calls through LiteLLM instead of direct OpenAI
              </p>
            </div>
          </div>

          {config.use_litellm && (
            <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn">
              {/* LiteLLM base URL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  LiteLLM base URL
                </label>
                <input
                  type="text"
                  value={config.litellm_base_url || 'http://localhost:4000'}
                  onChange={(e) => handleConfigUpdate({ litellm_base_url: e.target.value })}
                  placeholder="http://localhost:4000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                />
              </div>

              {/* LiteLLM API key */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  LiteLLM API key (master or virtual)
                </label>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-2">
                  Optional for some proxies; used as the Bearer token when set.
                </p>
                <div className="relative">
                  <input
                    type={showLitellmVirtualKey ? "text" : "password"}
                    value={config.litellm_virtual_key || ""}
                    onChange={(e) => handleConfigUpdate({ litellm_virtual_key: e.target.value })}
                    placeholder="sk-... (master or virtual) or leave empty"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLitellmVirtualKey(!showLitellmVirtualKey)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showLitellmVirtualKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* LiteLLM Guardrail Names */}
              {config.lakera_enabled && (
                <div className="space-y-3 pt-3 border-t border-gray-150">
                  <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                    In LiteLLM mode, the app selects a guardrail name based on Lakera blocking mode.
                    These names should match entries in <code className="text-xs bg-gray-100 px-1 rounded text-primary-600 font-mono">litellm/config.yaml</code>.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      LiteLLM guardrail name (blocking)
                    </label>
                    <input
                      type="text"
                      value={config.litellm_guardrail_name ?? ''}
                      onChange={(e) => handleConfigUpdate({ litellm_guardrail_name: e.target.value })}
                      placeholder="lakera-guard-block"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      LiteLLM guardrail name (monitor)
                    </label>
                    <input
                      type="text"
                      value={config.litellm_guardrail_monitor_name ?? ''}
                      onChange={(e) => handleConfigUpdate({ litellm_guardrail_monitor_name: e.target.value })}
                      placeholder="lakera-guard-monitor"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
