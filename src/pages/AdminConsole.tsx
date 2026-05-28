import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Eye, EyeOff,
  CheckCircle2, AlertCircle, RefreshCw, Zap, Sparkles, Settings, Key, ShieldCheck, Check, Loader2, Globe, Shield, Activity, Server, Brain,
  Upload, Image as LucideImage, Link2, X
} from 'lucide-react';
import { AppConfig, AppConfigUpdate, LLMIntegration } from '../types';
import { apiService } from '../services/api';
import UploadDropzone from '../components/UploadDropzone';
import ToolManager from '../components/ToolManager';
import GenerateContentModal from '../components/GenerateContentModal';
import RagManagement, { RagManagementRef } from '../components/RagManagement';
import DemoPromptManager from '../components/DemoPromptManager';
import Playground from '../components/Playground';
import MagicFantasyIcon from '../components/MagicFantasyIcon';
import kdmTitanProImg from '../assets/kdm_titan_pro.png';

type TabType = 'setup' | 'branding' | 'llm' | 'rag' | 'rag-scanning' | 'tools' | 'security' | 'prompts' | 'export' | 'playground';

const AdminConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('setup');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [ragScanningResult, setRagScanningResult] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showLitellmVirtualKey, setShowLitellmVirtualKey] = useState(false);
  const [showLakeraKey, setShowLakeraKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [ragScanningNotificationCount, setRagScanningNotificationCount] = useState<number>(0);

  // Branding Custom Upload State Variables
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [heroDragOver, setHeroDragOver] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [heroError, setHeroError] = useState<string | null>(null);

  // Setup Architecture Flow Simulator States
  const [simMode, setSimMode] = useState<'direct' | 'secure'>('secure');
  const [simStatus, setSimStatus] = useState<'idle' | 'sending' | 'scanning' | 'passed' | 'blocked'>('idle');
  const [simPromptType, setSimPromptType] = useState<'clean' | 'injection'>('clean');
  const [packetPos, setPacketPos] = useState({ left: '15%', top: '50%' });
  const [packetVisible, setPacketVisible] = useState(false);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const simulationTimeoutRef = useRef<number[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    setSimLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const runSimulation = () => {
    // Clear any active timeouts
    simulationTimeoutRef.current.forEach(clearTimeout);
    simulationTimeoutRef.current = [];

    // Reset positions and states
    setPacketPos({ left: '10%', top: '60%' });
    setPacketVisible(true);
    setSimStatus('sending');
    setSimLogs([]);

    addLog(`🔄 Connection simulation initialized in ${simMode === 'secure' ? 'SECURE' : 'DIRECT'} mode.`);
    addLog(`📤 Selected payload: ${simPromptType === 'clean' ? 'Safe Message' : '⚠️ Malicious Prompt Injection'}`);

    const timeouts: number[] = [];

    // All paths start: Client -> Backend Gateway
    addLog(`💻 Client dispatching request packet to backend gateway proxy...`);
    const t1 = window.setTimeout(() => {
      setPacketPos({ left: '38%', top: '60%' });
    }, 100);
    timeouts.push(t1);

    if (simMode === 'direct') {
      // Step 2: Backend receives, bypasses Lakera, sends directly to LLM
      const t2 = window.setTimeout(() => {
        addLog(`⚙️ Backend received request. Bypassing security scan. Forwarding directly to LLM...`);
        setPacketPos({ left: '85%', top: '60%' });
      }, 1200);
      timeouts.push(t2);

      // Step 3: Arrived at LLM
      const t3 = window.setTimeout(() => {
        setSimStatus('passed');
        if (simPromptType === 'injection') {
          addLog(`⚠️ [EXPLOITED] Payload executed on LLM with zero scanning! Target completion engine has been compromised.`);
        } else {
          addLog(`✅ Payload processed successfully by target LLM.`);
        }
      }, 2300);
      timeouts.push(t3);

      // Step 4: Fade out packet
      const t4 = window.setTimeout(() => {
        setPacketVisible(false);
      }, 4500);
      timeouts.push(t4);
    } else {
      // Secure Mode (Redirected to Lakera Guard)
      // Step 2: Backend intercepts, redirects to Lakera Guard
      const t2 = window.setTimeout(() => {
        addLog(`⚙️ Backend Gateway intercepted request. Intercept redirect active: Routing payload to Lakera Guard...`);
        setPacketPos({ left: '38%', top: '20%' });
      }, 1200);
      timeouts.push(t2);

      // Step 3: Arrived at Lakera Guard, start scanning
      const t3 = window.setTimeout(() => {
        setSimStatus('scanning');
        addLog(`🛡️ [SCANNING] Lakera Guard analyzing prompt signatures for attacks, jailbreaks, and sensitive data leakage...`);
      }, 2300);
      timeouts.push(t3);

      // Step 4: Scan complete (after 1.8 seconds)
      const t4 = window.setTimeout(() => {
        if (simPromptType === 'clean') {
          addLog(`✨ [CLEAN] Lakera Guard verified prompt payload as SAFE. Returning verification token to Backend...`);
          setPacketPos({ left: '38%', top: '60%' });
          setSimStatus('sending');

          // Step 5: Backend forwards verified prompt to LLM
          const t5 = window.setTimeout(() => {
            addLog(`⚙️ Backend received 'Safe' signal. Forwarding clean payload out to target LLM completion engine...`);
            setPacketPos({ left: '85%', top: '60%' });
          }, 1100);
          timeouts.push(t5);

          // Step 6: Lands at LLM
          const t6 = window.setTimeout(() => {
            setSimStatus('passed');
            addLog(`✅ Payload successfully and securely processed by target LLM.`);
          }, 2200);
          timeouts.push(t6);

          const t7 = window.setTimeout(() => {
            setPacketVisible(false);
          }, 4500);
          timeouts.push(t7);
        } else {
          // Blocked at Lakera Guard
          setSimStatus('blocked');
          addLog(`🚨 [ATTACK DETECTED] Lakera Guard flagged Prompt Injection threat with 99.9% confidence!`);
          addLog(`🛑 [TERMINATED] Lakera Guard instructs Backend to sever connection. Request rejected; target LLM was NEVER reached.`);

          const t5 = window.setTimeout(() => {
            setPacketVisible(false);
          }, 2000);
          timeouts.push(t5);
        }
      }, 4300);
      timeouts.push(t4);
    }

    simulationTimeoutRef.current = timeouts;
  };

  // Multi-LLM integration state variables
  const [integrations, setIntegrations] = useState<LLMIntegration[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('openai');
  const [hasInitialLoadedLLM, setHasInitialLoadedLLM] = useState(false);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [saveSuccessProvider, setSaveSuccessProvider] = useState<string | null>(null);

  // Local form editing states
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiBase, setFormApiBase] = useState('');
  const [formModelName, setFormModelName] = useState('');
  const [formConfigJson, setFormConfigJson] = useState<Record<string, any>>({});
  const [ragScanningProgress, setRagScanningProgress] = useState<{isScanning: boolean; current: number; total: number; filename?: string} | null>(null);
  const progressPollingRef = useRef<number | null>(null);
  const ragManagementRef = React.useRef<RagManagementRef>(null);

  // Export sections: safe defaults on, api_keys and project_ids off
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
  const [lastImportIncludes, setLastImportIncludes] = useState<string[] | null>(null);

  useEffect(() => {
    loadConfig();
    loadModels();
    loadLLMIntegrations();
    loadRagScanningResult();
  }, []);
 
  useEffect(() => {
    if (config) {
      applyTheme(config.theme);
    }
  }, [config?.theme]);

  const applyTheme = (theme?: string) => {
    const themes = ['blue', 'emerald', 'purple', 'amber'];
    const body = document.body;
    themes.forEach(t => body.classList.remove(`theme-${t}`));
    const key = theme && themes.includes(theme) ? theme : 'blue';
    body.classList.add(`theme-${key}`);
  };

  // Clear notification when user views the RAG scanning report
  useEffect(() => {
    if (activeTab === 'rag-scanning') {
      clearRagScanningNotification();
    }
  }, [activeTab]);

  // Reload models when switching to LLM tab (e.g. after saving LiteLLM key in Security)
  useEffect(() => {
    if (activeTab === 'llm') {
      loadModels();
      loadLLMIntegrations();
    }
  }, [activeTab]);

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

  // Poll for RAG scanning progress
  useEffect(() => {
    let intervalId: number;
    
    const pollProgress = async () => {
      try {
        const progress = await apiService.getRagScanningProgress();
        setRagScanningProgress(progress);
        
        // If progress is null or scanning is complete, stop polling
        if (!progress || !progress.isScanning) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = 0;
          }
          setRagScanningProgress(null);
        }
      } catch (error) {
        // No progress available, clear it and stop polling
        setRagScanningProgress(null);
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = 0;
        }
      }
    };

    // Start polling if RAG content scanning is enabled (regardless of current tab)
    if (config?.rag_content_scanning) {
      intervalId = setInterval(pollProgress, 1000); // Poll every second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [config?.rag_content_scanning]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (progressPollingRef.current) {
        clearInterval(progressPollingRef.current);
        progressPollingRef.current = null;
      }
    };
  }, []);

  // Start polling immediately when upload begins
  const startProgressPolling = () => {
    // Only poll if RAG content scanning is enabled in config
    if (!config?.rag_content_scanning) {
      return;
    }

    // Clear any existing polling
    if (progressPollingRef.current) {
      clearInterval(progressPollingRef.current);
      progressPollingRef.current = null;
    }

    // Show progress immediately with a placeholder
    setRagScanningProgress({
      isScanning: true,
      current: 0,
      total: 1,
      filename: "Uploading..."
    });

    let hasStartedScanning = false;
    let consecutive404s = 0;

    const pollProgress = async () => {
      try {
        const progress = await apiService.getRagScanningProgress();
        setRagScanningProgress(progress);
        
        // Reset 404 counter on successful response
        consecutive404s = 0;
        
        // If we get progress data, scanning has started
        if (progress) {
          hasStartedScanning = true;
        }
        
        // If progress is null or scanning is complete, stop polling
        if (!progress || !progress.isScanning) {
          if (progressPollingRef.current) {
            clearInterval(progressPollingRef.current);
            progressPollingRef.current = null;
          }
          // Keep the progress bar visible for a moment to show completion
          if (progress && !progress.isScanning) {
            setTimeout(() => setRagScanningProgress(null), 2000);
          } else {
            setRagScanningProgress(null);
          }
        }
      } catch (error: any) {
        console.log('Progress polling error:', error?.message);
        
        // If we get a 404, check if scanning has started
        if (error?.message?.includes('404') || error?.message?.includes('Not Found') || error?.message?.includes('API request failed: Not Found')) {
          consecutive404s++;
          
          // If scanning has started and we get 404s, it means scanning is complete
          if (hasStartedScanning) {
            console.log('Stopping progress polling - scanning completed');
            if (progressPollingRef.current) {
              clearInterval(progressPollingRef.current);
              progressPollingRef.current = null;
            }
            setRagScanningProgress(null);
          } else {
            // If scanning hasn't started yet, keep polling but limit consecutive 404s
            console.log(`Scanning not started yet, 404 count: ${consecutive404s}`);
            if (consecutive404s >= 10) {
              console.log('Too many 404s before scanning started, stopping polling');
              if (progressPollingRef.current) {
                clearInterval(progressPollingRef.current);
                progressPollingRef.current = null;
              }
              setRagScanningProgress(null);
            }
          }
        }
        // For other errors, keep trying for a bit
      }
    };
    
    // Start polling immediately, then continue with interval
    pollProgress();
    
    // Set up interval polling
    progressPollingRef.current = setInterval(pollProgress, 1000);
    
    // Clear interval after 2 minutes to prevent infinite polling
    setTimeout(() => {
      if (progressPollingRef.current) {
        clearInterval(progressPollingRef.current);
        progressPollingRef.current = null;
      }
      setRagScanningProgress(null);
    }, 120000);
  };

  const loadModels = async () => {
    try {
      const modelsData = await apiService.getModels();
      setAvailableModels(modelsData.models);
    } catch (error) {
      console.error('Failed to load models:', error);
      // Fallback to hardcoded models if API fails
      setAvailableModels([
        "gpt-5",
        "gpt-5-mini", 
        "gpt-5-nano",
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4",
        "gpt-4-turbo",
        "gpt-3.5-turbo"
      ]);
    }
  };

  const loadLLMIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const data = await apiService.getLLMIntegrations();
      setIntegrations(data);
      if (!hasInitialLoadedLLM || !selectedProvider) {
        if (config?.active_llm_provider) {
          setSelectedProvider(config.active_llm_provider);
        } else if (data.length > 0) {
          const active = data.find(i => i.enabled)?.provider || 'openai';
          setSelectedProvider(active);
        }
        setHasInitialLoadedLLM(true);
      }
    } catch (error) {
      console.error('Failed to load LLM integrations:', error);
      setMessage({ type: 'error', text: 'Failed to load LLM integrations' });
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const handleUpdateIntegration = async (provider: string, update: any) => {
    try {
      await apiService.updateLLMIntegration(provider, update);
      setMessage({ type: 'success', text: `${provider.replace('_', ' ').toUpperCase()} configuration saved successfully.` });
      await loadLLMIntegrations();
      await loadModels(); // Refresh available models in dropdown
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
    try {
      const response = await apiService.testLLMIntegration(provider);
      const isSuccess = response.status === 'success';
      setTestResult({
        provider,
        success: isSuccess,
        message: response.message
      });
      if (isSuccess) {
        setMessage({ type: 'success', text: `Connection test for ${provider.toUpperCase()} succeeded!` });
      } else {
        setMessage({ type: 'error', text: `Connection test for ${provider.toUpperCase()} failed.` });
      }
    } catch (error: any) {
      console.error('Test connection error:', error);
      setTestResult({
        provider,
        success: false,
        message: error.message || 'Network error or invalid response received.'
      });
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

  const loadRagScanningResult = async () => {
    try {
      const result = await apiService.getLastRagScanningResult();
      setRagScanningResult(result);
      
      // Set notification count based on blocked chunks
      if (result && result.blocked_chunks > 0) {
        setRagScanningNotificationCount(result.blocked_chunks);
      } else {
        setRagScanningNotificationCount(0);
      }
    } catch (error) {
      // No result available yet, that's okay
      setRagScanningResult(null);
      setRagScanningNotificationCount(0);
    }
  };

  const clearRagScanningNotification = () => {
    setRagScanningNotificationCount(0);
  };

  const loadConfig = async () => {
    try {
      const configData = await apiService.getConfig();
      // Ensure rag_content_scanning has a default value if not present
      if (configData.rag_content_scanning === undefined) {
        configData.rag_content_scanning = false;
      }
      setConfig(configData);
      if (configData.active_llm_provider) {
        setSelectedProvider(configData.active_llm_provider);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration' });
    }
  };

  const handleConfigUpdate = async (updates: Partial<AppConfigUpdate>) => {
    if (!config) return;

    try {
      // If Lakera is being disabled, also disable RAG content scanning
      const lakeraEnabled = updates.lakera_enabled ?? config.lakera_enabled;
      const ragContentScanning = lakeraEnabled 
        ? (updates.rag_content_scanning ?? config.rag_content_scanning)
        : false;

      const updatedConfig: AppConfigUpdate = {
        business_name: updates.business_name ?? config.business_name,
        tagline: updates.tagline ?? config.tagline,
        hero_text: updates.hero_text ?? config.hero_text,
        hero_image_url: updates.hero_image_url ?? config.hero_image_url,
        logo_url: updates.logo_url ?? config.logo_url,
        theme: updates.theme ?? config.theme,
        lakera_enabled: lakeraEnabled,
        lakera_blocking_mode: updates.lakera_blocking_mode ?? config.lakera_blocking_mode,
        rag_content_scanning: ragContentScanning,
        rag_lakera_project_id: updates.rag_lakera_project_id ?? config.rag_lakera_project_id,
        openai_model: updates.openai_model ?? config.openai_model,
        temperature: updates.temperature ?? config.temperature,
        system_prompt: updates.system_prompt ?? config.system_prompt,
        openai_api_key: updates.openai_api_key ?? config.openai_api_key,
        litellm_virtual_key: updates.litellm_virtual_key ?? config.litellm_virtual_key,
        litellm_guardrail_name: updates.litellm_guardrail_name ?? config.litellm_guardrail_name,
        litellm_guardrail_monitor_name:
          updates.litellm_guardrail_monitor_name ?? config.litellm_guardrail_monitor_name,
        lakera_api_key: updates.lakera_api_key ?? config.lakera_api_key,
        lakera_project_id: updates.lakera_project_id ?? config.lakera_project_id,
        use_litellm: updates.use_litellm ?? config.use_litellm,
        litellm_base_url: updates.litellm_base_url ?? config.litellm_base_url,
        active_llm_provider: updates.active_llm_provider ?? config.active_llm_provider,
      };

      await apiService.updateConfig(updatedConfig);
      await loadConfig();
      await loadModels();
      setMessage({ type: 'success', text: 'Configuration updated successfully' });
    } catch (error) {
      console.error('Failed to update config:', error);
      setMessage({ type: 'error', text: 'Failed to update configuration' });
    }
  };

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
    try {
      const response = await apiService.uploadBrandingAsset(file);
      await handleConfigUpdate({ logo_url: response.url });
      setMessage({ type: 'success', text: 'Logo uploaded and updated successfully!' });
    } catch (err: any) {
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
    try {
      const response = await apiService.uploadBrandingAsset(file);
      await handleConfigUpdate({ hero_image_url: response.url });
      setMessage({ type: 'success', text: 'Hero image uploaded and updated successfully!' });
    } catch (err: any) {
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
      await loadModels();
      if (result.metadata?.includes?.length) {
        setLastImportIncludes(result.metadata.includes);
        const labels: Record<string, string> = {
          appearance: 'Appearance',
          llm: 'LLM',
          security: 'Security',
          rag_scanning: 'RAG scanning',
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

  const tabs: { id: TabType; label: string; notificationCount?: number }[] = [
    { id: 'setup', label: 'Setup' },
    { id: 'branding', label: 'Branding' },
    { id: 'llm', label: 'LLM' },
    { id: 'rag', label: 'RAG' },
    { id: 'rag-scanning', label: 'RAG Scanning Report', ...(ragScanningNotificationCount > 0 && { notificationCount: ragScanningNotificationCount }) },
    { id: 'tools', label: 'Tools' },
    { id: 'security', label: 'Security' },
    { id: 'prompts', label: 'Demo Prompts' },
    { id: 'playground', label: 'Playground 🧪' },
    { id: 'export', label: 'Export/Import' },
  ];

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Demo</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4`}>
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{tab.label}</span>
                  {tab.notificationCount !== undefined && tab.notificationCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {tab.notificationCount}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'setup' && (
            <div className="space-y-8">
              {/* Rework Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <Shield className="w-7 h-7 text-primary-600 animate-pulse" />
                    Interactive Architectural Flow
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Visualize how the application intercept and redirect flows protect your LLM infrastructure from prompt injections.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                    <Activity className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
                    Active Gateway Mode
                  </span>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Control Panel (4 Columns) */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      Simulator Controls
                    </h3>

                    {/* Step 1: Mode Select */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        1. Select Connection Route
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSimMode('direct');
                            setSimStatus('idle');
                            setPacketVisible(false);
                            setSimLogs([]);
                          }}
                          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                            simMode === 'direct'
                              ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${simMode === 'direct' ? 'bg-amber-500 animate-ping' : 'bg-gray-400'}`} />
                            <span className="font-bold text-sm text-gray-900">Direct Connection</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Traditional flow: App connects directly to the target LLM with zero guardrails.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSimMode('secure');
                            setSimStatus('idle');
                            setPacketVisible(false);
                            setSimLogs([]);
                          }}
                          className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                            simMode === 'secure'
                              ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${simMode === 'secure' ? 'bg-primary-500 animate-ping' : 'bg-gray-400'}`} />
                            <span className="font-bold text-sm text-gray-900">Lakera Redirect (Secure)</span>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Rerouted flow: Gateway redirects prompt traffic through Lakera Guard for active threat scanning.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Step 2: Payload Select */}
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        2. Select Payload Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSimPromptType('clean');
                            setSimStatus('idle');
                            setPacketVisible(false);
                            setSimLogs([]);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                            simPromptType === 'clean'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Clean Query
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSimPromptType('injection');
                            setSimStatus('idle');
                            setPacketVisible(false);
                            setSimLogs([]);
                          }}
                          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-semibold text-sm transition-all ${
                            simPromptType === 'injection'
                              ? 'border-red-500 bg-red-50 text-red-800'
                              : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                          }`}
                        >
                          <AlertCircle className="w-4 h-4 text-red-600 animate-bounce" />
                          Prompt Injection
                        </button>
                      </div>
                    </div>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={runSimulation}
                      disabled={simStatus === 'sending' || simStatus === 'scanning'}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                        simStatus === 'sending' || simStatus === 'scanning'
                          ? 'bg-gray-400 cursor-not-allowed shadow-none'
                          : simMode === 'secure'
                          ? 'bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 active:scale-95 shadow-primary-500/20'
                          : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 active:scale-95 shadow-amber-500/20'
                      }`}
                    >
                      {simStatus === 'sending' || simStatus === 'scanning' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Simulating Route...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Simulate Packet Flow
                        </>
                      )}
                    </button>
                  </div>

                  {/* Informational Help card */}
                  <div className="bg-slate-50 border border-gray-200 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">How to test this setup?</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      In production, the agent client automatically intercepts standard prompt queries and forces redirection through the highly secure <span className="font-semibold text-indigo-700">Lakera Guard API proxy</span>. This sandbox simulates both the standard insecure bypass and the secure rerouting path.
                    </p>
                    <div className="text-xs text-indigo-800 font-semibold bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-indigo-600" />
                      Tip: Run a Prompt Injection on both routes to see security in action!
                    </div>
                  </div>
                </div>

                {/* Simulation Screen & Terminal (8 Columns) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Visual Canvas Container */}
                  <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-8 border border-slate-800/80 overflow-hidden shadow-2xl h-[410px] flex flex-col justify-between bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_24px]">
                    {/* Background glow effects */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_20%,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,rgba(16,185,129,0.05),transparent_40%)] pointer-events-none" />
                    
                    {simStatus === 'scanning' && (
                      <div className="absolute top-[20%] left-[38%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full animate-ping pointer-events-none" style={{ animationDuration: '1.5s' }} />
                    )}

                    {/* Path Connection Lines SVG overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none animate-pulse-glow" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        {/* Define glowing linear gradients */}
                        <linearGradient id="grad-client-backend" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="grad-backend-lakera" x1="0%" y1="100%" x2="0%" y2="0%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="grad-backend-llm-clean" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                        </linearGradient>
                        <linearGradient id="grad-backend-llm-warn" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                        </linearGradient>

                        {/* Drop shadow filters for realistic neon glows */}
                        <filter id="neon-glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="neon-glow-indigo" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <filter id="neon-glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      <style>{`
                        @keyframes dash {
                          to {
                            stroke-dashoffset: -40;
                          }
                        }
                        .animate-glow-flow {
                          stroke-dasharray: 6 3;
                          animation: dash 1s linear infinite;
                        }
                      `}</style>

                      {/* Connection 1: Client to Backend */}
                      <path
                        d="M 10 60 L 38 60"
                        fill="none"
                        filter="url(#neon-glow-blue)"
                        className={`stroke-2 transition-all duration-500 ${
                          simStatus === 'sending' && parseFloat(packetPos.left) < 38
                            ? 'stroke-[cyan] animate-glow-flow opacity-100'
                            : simStatus === 'passed'
                            ? 'stroke-emerald-500/40 stroke-[2px] opacity-80'
                            : simStatus === 'blocked'
                            ? 'stroke-red-500/30 stroke-[2px] opacity-60'
                            : 'stroke-blue-500/30 stroke-[2px] opacity-50'
                        }`}
                        style={{ stroke: simStatus === 'sending' && parseFloat(packetPos.left) < 38 ? undefined : 'url(#grad-client-backend)' }}
                      />

                      {/* Connection 2: Backend to Lakera (Intercept Redirect) */}
                      <path
                        d="M 38 60 L 38 20"
                        fill="none"
                        filter={simMode === 'secure' ? 'url(#neon-glow-indigo)' : undefined}
                        className={`stroke-2 transition-all duration-500 ${
                          simMode === 'secure'
                            ? simStatus === 'sending' && parseFloat(packetPos.top) < 60 && parseFloat(packetPos.left) === 38
                              ? 'stroke-[violet] stroke-[3px] animate-glow-flow opacity-100'
                              : simStatus === 'scanning'
                              ? 'stroke-indigo-400 stroke-[3px] animate-pulse opacity-100'
                              : simStatus === 'passed'
                              ? 'stroke-emerald-500/30 stroke-[1.5px] opacity-60'
                              : simStatus === 'blocked'
                              ? 'stroke-red-500/60 stroke-[3px] opacity-100'
                              : 'stroke-indigo-500/30 stroke-[2px] opacity-50'
                            : 'stroke-slate-800/40 stroke-[1.5px]'
                        }`}
                        strokeDasharray={simMode === 'secure' ? undefined : '4 4'}
                        style={{ stroke: simMode === 'secure' && simStatus !== 'sending' && simStatus !== 'scanning' && simStatus !== 'blocked' ? 'url(#grad-backend-lakera)' : undefined }}
                      />

                      {/* Connection 3: Backend to LLM */}
                      <path
                        d="M 38 60 L 85 60"
                        fill="none"
                        filter="url(#neon-glow-emerald)"
                        className={`stroke-2 transition-all duration-500 ${
                          simStatus === 'sending' && parseFloat(packetPos.left) > 38
                            ? simMode === 'secure'
                              ? 'stroke-[emerald] stroke-[3px] animate-glow-flow opacity-100'
                              : 'stroke-[amber] stroke-[3px] animate-glow-flow opacity-100'
                            : simStatus === 'passed'
                            ? simPromptType === 'injection' && simMode === 'direct'
                              ? 'stroke-amber-500/60 stroke-[3px] opacity-100'
                              : 'stroke-emerald-500/60 stroke-[3px] opacity-100'
                            : 'stroke-emerald-500/30 stroke-[2px] opacity-50'
                        }`}
                        style={{ stroke: simStatus === 'passed' ? (simPromptType === 'injection' && simMode === 'direct' ? 'url(#grad-backend-llm-warn)' : 'url(#grad-backend-llm-clean)') : 'url(#grad-backend-llm-clean)' }}
                      />
                    </svg>

                    {/* Nodes Grid */}
                    <div className="relative w-full h-full">
                      {/* Node 1: Client Application (Left Center) */}
                      <div className="absolute left-[10%] top-[60%] -translate-x-1/2 -translate-y-1/2">
                        <div className={`relative w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-lg border backdrop-blur-md ${
                          simStatus === 'sending' && parseFloat(packetPos.left) === 10
                            ? 'bg-blue-950/80 border-blue-400 scale-105 ring-4 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                            : 'bg-slate-900/80 border-slate-700/60 hover:border-slate-600/80'
                        }`}>
                          <Globe className={`w-6 h-6 ${simStatus === 'sending' && parseFloat(packetPos.left) === 10 ? 'text-blue-300' : 'text-blue-400'}`} />
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 animate-pulse" />

                          {/* Label positioned absolutely below the box with no layout shifting */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center pointer-events-none">
                            <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-nowrap">User App</span>
                            <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-tight text-nowrap">Origin Client</span>
                          </div>
                        </div>
                      </div>

                      {/* Node 2: Backend Gateway Node (Center Center) */}
                      <div className="absolute left-[38%] top-[60%] -translate-x-1/2 -translate-y-1/2">
                        <div className={`relative w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-lg border backdrop-blur-md ${
                          simStatus === 'sending' && parseFloat(packetPos.left) === 38 && parseFloat(packetPos.top) === 60
                            ? 'bg-purple-950/80 border-purple-400 scale-105 ring-4 ring-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                            : 'bg-slate-900/80 border-slate-700/60 hover:border-slate-600/80'
                        }`}>
                          <Server className={`w-6 h-6 ${simStatus === 'sending' && parseFloat(packetPos.left) === 38 && parseFloat(packetPos.top) === 60 ? 'text-purple-300' : 'text-purple-400'}`} />
                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 animate-pulse" />

                          {/* Label positioned absolutely below the box with no layout shifting */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center pointer-events-none">
                            <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-nowrap">Backend API</span>
                            <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-tight text-nowrap">Gateway Proxy</span>
                          </div>
                        </div>
                      </div>

                      {/* Node 3: Lakera Guard Proxy (Top Center) */}
                      <div className={`absolute left-[38%] top-[20%] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                        simMode === 'direct' ? 'opacity-25 filter grayscale' : 'opacity-100'
                      }`}>
                        <div className={`relative w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-lg border backdrop-blur-md ${
                          simStatus === 'scanning'
                            ? 'bg-indigo-950/90 border-indigo-400 scale-110 ring-4 ring-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.5)]'
                            : simStatus === 'blocked'
                            ? 'bg-red-950/90 border-red-500 scale-110 shadow-[0_0_25px_rgba(220,38,38,0.5)] animate-pulse'
                            : 'bg-slate-900/80 border-slate-700/60 hover:border-slate-600/80'
                        }`}>
                          <Shield className={`w-6 h-6 ${
                            simStatus === 'scanning' ? 'text-indigo-300 animate-pulse' : simStatus === 'blocked' ? 'text-red-400' : 'text-indigo-400'
                          }`} />
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${simStatus === 'blocked' ? 'bg-red-500 animate-ping' : simStatus === 'scanning' ? 'bg-indigo-400 animate-ping' : 'bg-indigo-500'}`} />

                          {/* Label positioned absolutely above the box with no layout shifting */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 text-center pointer-events-none">
                            <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-nowrap">Lakera Guard</span>
                            <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-tight text-nowrap">Threat Scanner</span>
                          </div>
                        </div>
                      </div>

                      {/* Node 4: LLM Engine (Right Center) */}
                      <div className="absolute left-[85%] top-[60%] -translate-x-1/2 -translate-y-1/2">
                        <div className={`relative w-14 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-lg border backdrop-blur-md ${
                          simStatus === 'passed'
                            ? simPromptType === 'injection' && simMode === 'direct'
                              ? 'bg-amber-950/80 border-amber-500 scale-105 ring-4 ring-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                              : 'bg-emerald-950/80 border-emerald-400 scale-105 ring-4 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                            : 'bg-slate-900/80 border-slate-700/60 hover:border-slate-600/80'
                        }`}>
                          <Brain className={`w-6 h-6 ${
                            simStatus === 'passed' && simPromptType === 'injection' && simMode === 'direct'
                              ? 'text-amber-400 animate-bounce'
                              : simStatus === 'passed'
                              ? 'text-emerald-400'
                              : 'text-purple-400'
                          }`} />
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${simStatus === 'passed' ? (simPromptType === 'injection' && simMode === 'direct' ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-purple-500'}`} />

                          {/* Label positioned absolutely below the box with no layout shifting */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-center pointer-events-none">
                            <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider text-nowrap">Target LLM</span>
                            <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-tight text-nowrap">Completion</span>
                          </div>
                        </div>
                      </div>

                      {/* Animated Packet Dot */}
                      {packetVisible && (
                        <div
                          className={`absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out flex items-center justify-center z-20 ${
                            simStatus === 'scanning'
                              ? 'scale-125 bg-indigo-500 shadow-[0_0_25px_rgba(99,102,241,1)]'
                              : simStatus === 'blocked'
                              ? 'scale-125 bg-red-600 shadow-[0_0_30px_rgba(220,38,38,1)] animate-bounce'
                              : simPromptType === 'injection'
                              ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]'
                              : 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)]'
                          }`}
                          style={{
                            left: packetPos.left,
                            top: packetPos.top,
                          }}
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Status Floating Box */}
                    <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Live Status</span>
                        <span className={`text-xs font-black tracking-wide ${
                          simStatus === 'idle' ? 'text-slate-400' :
                          simStatus === 'sending' ? 'text-blue-400 animate-pulse' :
                          simStatus === 'scanning' ? 'text-indigo-400 animate-pulse' :
                          simStatus === 'passed' ? 'text-emerald-400' : 'text-red-500'
                        }`}>
                          {simStatus === 'idle' && 'READY'}
                          {simStatus === 'sending' && 'PACKET IN-FLIGHT'}
                          {simStatus === 'scanning' && 'LAKERA SCANNING'}
                          {simStatus === 'passed' && (simPromptType === 'injection' && simMode === 'direct' ? 'COMPROMISED ⚠️' : 'DELIVERED SAFELY ✅')}
                          {simStatus === 'blocked' && 'BLOCKED 🛑'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Streaming Terminal */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 font-mono text-xs flex flex-col justify-between min-h-[170px] max-h-[170px] overflow-hidden shadow-2xl relative">
                    {/* Retro console top bar */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        </div>
                        <span className="text-slate-400 font-bold ml-2 flex items-center gap-2 text-[11px] tracking-wider uppercase">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE PROXY STREAM LOGS
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSimLogs([])}
                        className="text-[10px] text-slate-500 hover:text-slate-300 font-bold transition-colors uppercase tracking-wider hover:underline"
                      >
                        Clear logs
                      </button>
                    </div>
                    <div className="flex-1 space-y-1.5 overflow-y-auto pr-2 custom-scrollbar">
                      {simLogs.length === 0 ? (
                        <div className="text-slate-600 italic flex items-center gap-1.5 py-4">
                          <span className="animate-pulse">_</span> No active packet transmissions. Click &quot;Simulate Packet Flow&quot; to inspect requests.
                        </div>
                      ) : (
                        simLogs.map((log, idx) => {
                          let textColor = 'text-slate-300';
                          if (log.includes('⚠️') || log.includes('EXPLOITED')) textColor = 'text-amber-400 font-semibold';
                          else if (log.includes('🚨') || log.includes('🛑') || log.includes('BLOCKED')) textColor = 'text-red-400 font-semibold';
                          else if (log.includes('✅') || log.includes('✨')) textColor = 'text-emerald-400 font-medium';
                          else if (log.includes('🔍')) textColor = 'text-indigo-400';
                          return (
                            <div key={idx} className={`${textColor} leading-normal border-l-2 pl-3 py-0.5 text-[11px] font-medium transition-all ${
                              log.includes('🚨') ? 'border-red-500' : log.includes('⚠️') ? 'border-amber-500' : 'border-slate-800'
                            }`}>
                              {log}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
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
          )}

          {activeTab === 'llm' && (
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
                    name: 'OpenAI / LiteLLM',
                    desc: 'Standard GPT-4o models & enterprise proxies.',
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
                    name: 'AI Gateway',
                    desc: 'Generic OpenAI-compatible proxy, gateway or local Ollama.',
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
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                      
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prov.gradient} flex items-center justify-center text-white font-bold text-lg shadow-sm mb-4`}>
                        {prov.id === 'openai' && <Sparkles className="w-5 h-5" />}
                        {prov.id === 'claude' && <Zap className="w-5 h-5" />}
                        {prov.id === 'minimax' && <Settings className="w-5 h-5" />}
                        {prov.id === 'vertex_ai' && <ShieldCheck className="w-5 h-5" />}
                        {prov.id === 'gemini' && <Sparkles className="w-5 h-5 animate-pulse" />}
                        {prov.id === 'ai_gateway' && <Globe className="w-5 h-5" />}
                      </div>

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
                              onChange={(e) => setFormConfigJson(prev => ({ ...prev, group_id: e.target.value }))}
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
                                    setFormConfigJson(prev => ({ ...prev, credentials_json: val }));
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
                                  onChange={(e) => setFormConfigJson(prev => ({ ...prev, project_id: e.target.value }))}
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
                                  onChange={(e) => setFormConfigJson(prev => ({ ...prev, location: e.target.value }))}
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
                              value={formApiBase}
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
          )}

          {activeTab === 'rag' && (
            <div className="space-y-6">
              {/* RAG Scanning Progress Indicator - Only show on RAG tab */}
              {ragScanningProgress && ragScanningProgress.isScanning && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-blue-900">
                        Scanning content for security threats...
                      </div>
                      <div className="text-xs text-blue-700 mt-1">
                        {ragScanningProgress.filename && `File: ${ragScanningProgress.filename}`}
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                          <span>Progress</span>
                          <span>{ragScanningProgress.current} / {ragScanningProgress.total} chunks</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(ragScanningProgress.current / ragScanningProgress.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-lg font-semibold text-gray-900">RAG Configuration</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-4">Upload Documents</h3>
                  <UploadDropzone 
                    onUploadStart={() => {
                      // Start progress polling immediately when upload begins
                      startProgressPolling();
                    }}
                    onUploadComplete={() => {
                      setMessage({ type: 'success', text: 'Document uploaded successfully' });
                      ragManagementRef.current?.refresh();
                      // Refresh RAG scanning results after upload
                      setTimeout(() => loadRagScanningResult(), 1000);
                    }} 
                  />
                </div>
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-4">Generate AI Content</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-4">
                      Generate industry-specific content using AI and add it to your RAG system.
                    </p>
                    <button 
                      onClick={() => setIsGenerateModalOpen(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                    >
                      Generate Content
                    </button>
                  </div>
                </div>
                <div>
                  <RagManagement 
                    ref={ragManagementRef}
                    onUploadStart={() => {
                      // Start progress polling immediately when upload begins
                      startProgressPolling();
                    }}
                    onUploadComplete={() => {
                      setMessage({ type: 'success', text: 'Document uploaded successfully' });
                      ragManagementRef.current?.refresh();
                      // Refresh RAG scanning results after upload
                      setTimeout(() => loadRagScanningResult(), 1000);
                    }}
                    onGenerateComplete={() => setMessage({ type: 'success', text: 'Content generated successfully' })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rag-scanning' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">RAG Content Scanning Report</h2>
              
              {!config.rag_content_scanning ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <div className="text-yellow-600">⚠️</div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-900">RAG Content Scanning Disabled</h3>
                      <p className="text-sm text-yellow-800 mt-1">
                        RAG content scanning is currently disabled. Enable it in the Security tab to scan uploaded documents for malicious content.
                      </p>
                    </div>
                  </div>
                </div>
              ) : !ragScanningResult ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">ℹ️</div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-900">No Scanning Results Yet</h3>
                      <p className="text-sm text-blue-800 mt-1">
                        Upload a document in the RAG tab to see content scanning results here. Any blocked content will be reported with detailed information.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-lg border ${
                  ragScanningResult.blocked_chunks > 0 && ragScanningResult.safe_chunks === 0
                    ? 'bg-red-50 border-red-200' // All content blocked
                    : ragScanningResult.blocked_chunks > 0
                    ? 'bg-yellow-50 border-yellow-200' // Some content blocked
                    : 'bg-green-50 border-green-200' // All content safe
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className={`text-lg font-medium ${
                        ragScanningResult.blocked_chunks > 0 && ragScanningResult.safe_chunks === 0
                          ? 'text-red-900' // All content blocked
                          : ragScanningResult.blocked_chunks > 0
                          ? 'text-yellow-900' // Some content blocked
                          : 'text-green-900' // All content safe
                      }`}>
                        Scanning Results
                      </h3>
                      {ragScanningResult.blocked_chunks > 0 && ragScanningResult.safe_chunks === 0 && (
                        <span className="bg-red-200 text-red-800 text-sm px-3 py-1 rounded-full font-medium">
                          ALL CONTENT BLOCKED
                        </span>
                      )}
                      {ragScanningResult.blocked_chunks > 0 && ragScanningResult.safe_chunks > 0 && (
                        <span className="bg-yellow-200 text-yellow-800 text-sm px-3 py-1 rounded-full font-medium">
                          PARTIAL BLOCK
                        </span>
                      )}
                      {ragScanningResult.blocked_chunks === 0 && (
                        <span className="bg-green-200 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
                          ALL CONTENT SAFE
                        </span>
                      )}
                    </div>
                    <button
                      onClick={loadRagScanningResult}
                      className={`text-sm px-4 py-2 rounded-lg font-medium ${
                        ragScanningResult.blocked_chunks > 0 && ragScanningResult.safe_chunks === 0
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : ragScanningResult.blocked_chunks > 0
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Refresh Results
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600 text-lg">✅</span>
                          <div>
                            <div className="text-2xl font-bold text-green-600">{ragScanningResult.safe_chunks}</div>
                            <div className="text-sm text-gray-600">Safe Chunks</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600 text-lg">🚫</span>
                          <div>
                            <div className="text-2xl font-bold text-red-600">{ragScanningResult.blocked_chunks}</div>
                            <div className="text-sm text-gray-600">Blocked Chunks</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600 text-lg">📄</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate">{ragScanningResult.filename}</div>
                            <div className="text-sm text-gray-600">Scanned File</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {ragScanningResult.blocked_chunks > 0 && ragScanningResult.safe_chunks === 0 && (
                      <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <span className="text-red-600 text-lg">⚠️</span>
                          <div>
                            <h4 className="font-medium text-red-900">Security Alert</h4>
                            <p className="text-sm text-red-800 mt-1">
                              All content in this file was blocked by security scanning. No content was added to the RAG database. 
                              Check the detailed results below for specific reasons why each chunk was blocked.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {ragScanningResult.results && ragScanningResult.results.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-gray-900">Detailed Chunk Analysis</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {ragScanningResult.results.map((result: any, index: number) => (
                            <div key={index} className={`p-4 rounded-lg border ${
                              result.is_safe 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">Chunk {result.chunk_index}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    result.is_safe 
                                      ? 'bg-green-200 text-green-800' 
                                      : 'bg-red-200 text-red-800'
                                  }`}>
                                    {result.is_safe ? '✅ Safe' : '🚫 Blocked'}
                                  </span>
                                </div>
                                {!result.is_safe && result.reason && (
                                  <span className="text-xs text-red-600 font-medium">
                                    Reason: {result.reason}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                {result.chunk_text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Tool Management</h2>
              <ToolManager />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Security Configuration</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={() => handleConfigUpdate({ lakera_enabled: !config.lakera_enabled })}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            config.lakera_enabled ? 'bg-primary-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config.lakera_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <label className="text-sm font-medium text-gray-700">
                          Enable Lakera Guard
                        </label>
                      </div>
                      
                      {config.lakera_enabled && (
                        <div className="ml-8 p-4 bg-gray-50 rounded-lg border">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Security Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Blocking Mode Toggle */}
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => handleConfigUpdate({ lakera_blocking_mode: !config.lakera_blocking_mode })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                  config.lakera_blocking_mode ? 'bg-red-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    config.lakera_blocking_mode ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <div>
                                <label className="text-sm font-medium text-gray-700">
                                  Blocking Mode
                                </label>
                                <p className="text-xs text-gray-500">
                                  Block flagged content instead of just logging
                                </p>
                              </div>
                            </div>
                            
                            {/* RAG Content Scanning Toggle */}
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                onClick={() => handleConfigUpdate({ rag_content_scanning: !config.rag_content_scanning })}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                  config.rag_content_scanning ? 'bg-primary-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    config.rag_content_scanning ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                              <div>
                                <label className="text-sm font-medium text-gray-700">
                                  RAG Content Scanning
                                </label>
                                <p className="text-xs text-gray-500">
                                  Scan document chunks during ingestion
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {config.rag_content_scanning && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            RAG Scanning Project ID
                          </label>
                          <input
                            type="text"
                            value={config.rag_lakera_project_id || ''}
                            onChange={(e) => handleConfigUpdate({ rag_lakera_project_id: e.target.value })}
                            placeholder="project-8541012967"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <p className="text-xs text-gray-500">
                            Separate project ID for RAG content scanning to keep it isolated from chat interface scanning.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {config.lakera_enabled && (
                    <div className="text-xs text-gray-500 max-w-xs">
                      {config.lakera_blocking_mode 
                        ? "🚫 Blocking mode enabled - flagged content will be blocked" 
                        : "📝 Logging mode - flagged content will be logged but allowed"}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleConfigUpdate({ use_litellm: !(config.use_litellm ?? false) })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      config.use_litellm ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        (config.use_litellm ?? false) ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Use LiteLLM proxy
                    </label>
                    <p className="text-xs text-gray-500">
                      Route LLM calls through LiteLLM instead of direct OpenAI
                    </p>
                  </div>
                </div>
                {(config.use_litellm ?? false) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LiteLLM base URL
                    </label>
                    <input
                      type="text"
                      value={config.litellm_base_url || 'http://localhost:4000'}
                      onChange={(e) => handleConfigUpdate({ litellm_base_url: e.target.value })}
                      placeholder="http://localhost:4000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
                {!(config.use_litellm ?? false) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      OpenAI API key
                    </label>
                    <div className="relative">
                      <input
                        type={showOpenAIKey ? "text" : "password"}
                        value={config.openai_api_key || ""}
                        onChange={(e) => handleConfigUpdate({ openai_api_key: e.target.value })}
                        placeholder="sk-..."
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showOpenAIKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {(config.use_litellm ?? false) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LiteLLM API key (master or virtual)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Optional for some proxies; used as the Bearer token when set.
                    </p>
                    <div className="relative">
                      <input
                        type={showLitellmVirtualKey ? "text" : "password"}
                        value={config.litellm_virtual_key || ""}
                        onChange={(e) => handleConfigUpdate({ litellm_virtual_key: e.target.value })}
                        placeholder="sk-... (master or virtual) or leave empty"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLitellmVirtualKey(!showLitellmVirtualKey)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showLitellmVirtualKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {(config.use_litellm ?? false) && config.lakera_enabled && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600">
                      In LiteLLM mode, the app selects a guardrail name based on Lakera blocking mode.
                      These names should match entries in <code className="text-xs bg-gray-100 px-1 rounded">litellm/config.yaml</code>.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LiteLLM guardrail name (blocking)
                      </label>
                      <input
                        type="text"
                        value={config.litellm_guardrail_name ?? ''}
                        onChange={(e) => handleConfigUpdate({ litellm_guardrail_name: e.target.value })}
                        placeholder="lakera-guard-block"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        LiteLLM guardrail name (monitor)
                      </label>
                      <input
                        type="text"
                        value={config.litellm_guardrail_monitor_name ?? ''}
                        onChange={(e) =>
                          handleConfigUpdate({ litellm_guardrail_monitor_name: e.target.value })
                        }
                        placeholder="lakera-guard-monitor"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lakera API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showLakeraKey ? "text" : "password"}
                      value={config.lakera_api_key || ""}
                      onChange={(e) => handleConfigUpdate({ lakera_api_key: e.target.value })}
                      placeholder="lk-..."
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLakeraKey(!showLakeraKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showLakeraKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lakera Project ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.lakera_project_id || ''}
                    onChange={(e) => handleConfigUpdate({ lakera_project_id: e.target.value })}
                    placeholder="project-8541012967"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Include a project ID for Lakera Guard requests
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prompts' && (
            <div className="space-y-6">
              <DemoPromptManager />
            </div>
          )}

          {activeTab === 'playground' && (
            <Playground />
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Export/Import Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800 mb-4">Export Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Choose what to include. By default, API keys and project IDs are excluded so the file is safe to share for demo setup.
                  </p>
                  <div className="space-y-2 mb-4">
                    {[
                      { key: 'appearance', label: 'Appearance (branding, hero, logo)' },
                      { key: 'llm', label: 'LLM settings (model, temperature, system prompt)' },
                      { key: 'security', label: 'Security toggles (Lakera enabled/blocking)' },
                      { key: 'rag_scanning', label: 'RAG scanning (toggle only)' },
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
                        <span className="text-sm text-gray-700">Include API keys</span>
                      </label>
                      <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Only for your own backup; do not share.</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={exportInclude.project_ids ?? false}
                          onChange={(e) => setExportInclude((prev) => ({ ...prev, project_ids: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Include project IDs</span>
                      </label>
                      <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">Only for your own backup; do not share.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800 mb-4">Import Configuration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a previously exported zip. Only the sections present in the file are applied; your API keys and project IDs are left unchanged unless the file included them.
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    To get demo prompts, export from an environment that already has them (with &quot;Demo prompts&quot; checked), then import that file here. Zips from the old export format do not include demo prompts.
                  </p>
                  {lastImportIncludes && lastImportIncludes.length > 0 && (
                    <p className="text-sm text-gray-600 mb-4">
                      Last import applied: {lastImportIncludes.join(', ')}
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
            </div>
          )}
        </div>
      </div>

      {/* Generate Content Modal */}
      <GenerateContentModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onContentGenerated={() => {
          setMessage({ type: 'success', text: 'Content generated and ingested successfully' });
          setIsGenerateModalOpen(false);
          ragManagementRef.current?.refresh();
        }}
      />
    </div>
  );
};

export default AdminConsole;

