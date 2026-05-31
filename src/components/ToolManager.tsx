import React, { useState, useEffect } from 'react';
import { 
  Plus, Settings, Play, Trash2, Search, Sparkles, 
  BookOpen, ChevronDown, ChevronUp, Copy, Check, Loader2 
} from 'lucide-react';
import { Tool, ToolCreate, MCPToolUseCase, MCPToolUseCaseCreate } from '../types';
import { apiService } from '../services/api';

interface ToolManagerProps {
  onTryInChat?: (prompt: string) => void;
}

const ToolManager: React.FC<ToolManagerProps> = ({ onTryInChat }) => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [testResults, setTestResults] = useState<Record<number, any>>({});
  const [testResultTabs, setTestResultTabs] = useState<Record<number, 'summary' | 'raw'>>({});

  // Playbook Playbook Use Cases State
  const [activePlaybookToolId, setActivePlaybookToolId] = useState<number | null>(null);
  const [usecases, setUseCases] = useState<Record<number, MCPToolUseCase[]>>({});
  const [loadingUseCases, setLoadingUseCases] = useState<Record<number, boolean>>({});
  const [generatingUseCases, setGeneratingUseCases] = useState<Record<number, boolean>>({});
  const [copiedUseCaseId, setCopiedUseCaseId] = useState<number | null>(null);

  // Manual Use Case Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeUseCase, setActiveUseCase] = useState<MCPToolUseCase | null>(null);
  const [modalToolId, setModalToolId] = useState<number | null>(null);
  const [modalForm, setModalForm] = useState<MCPToolUseCaseCreate>({
    mcp_tool_name: '',
    title: '',
    description: '',
    sample_prompt: '',
    expected_outcome: '',
  });

  const [newTool, setNewTool] = useState<ToolCreate>({
    name: '',
    description: '',
    endpoint: '',
    type: 'mcp',
    enabled: true,
    config_json: {},
  });

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setIsLoading(true);
    try {
      const toolsData = await apiService.getTools();
      setTools(toolsData);
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTool = async () => {
    try {
      await apiService.createTool(newTool);
      setNewTool({
        name: '',
        description: '',
        endpoint: '',
        type: 'mcp',
        enabled: true,
        config_json: {},
      });
      setShowAddForm(false);
      await loadTools();
    } catch (error) {
      console.error('Failed to add tool:', error);
    }
  };

  const handleUpdateTool = async (tool: Tool) => {
    try {
      await apiService.updateTool(tool.id, {
        name: tool.name,
        description: tool.description,
        endpoint: tool.endpoint,
        type: tool.type,
        enabled: tool.enabled,
        config_json: tool.config_json,
      });
      setEditingTool(null);
      await loadTools();
    } catch (error) {
      console.error('Failed to update tool:', error);
    }
  };

  const handleDeleteTool = async (toolId: number) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    
    try {
      await apiService.deleteTool(toolId);
      await loadTools();
    } catch (error) {
      console.error('Failed to delete tool:', error);
    }
  };

  const handleTestTool = async (toolId: number) => {
    try {
      const result = await apiService.testTool(toolId, { test: true });
      setTestResults(prev => ({ ...prev, [toolId]: result }));
    } catch (error) {
      console.error('Failed to test tool:', error);
      setTestResults(prev => ({ ...prev, [toolId]: { error: 'Test failed' } }));
    }
  };

  // Playbook Actions
  const loadUseCases = async (toolId: number) => {
    setLoadingUseCases(prev => ({ ...prev, [toolId]: true }));
    try {
      const data = await apiService.getUseCases(toolId);
      setUseCases(prev => ({ ...prev, [toolId]: data }));
    } catch (error) {
      console.error('Failed to load use cases:', error);
    } finally {
      setLoadingUseCases(prev => ({ ...prev, [toolId]: false }));
    }
  };

  const togglePlaybook = async (toolId: number) => {
    if (activePlaybookToolId === toolId) {
      setActivePlaybookToolId(null);
    } else {
      setActivePlaybookToolId(toolId);
      await loadUseCases(toolId);
    }
  };

  const handleGenerateUseCases = async (toolId: number) => {
    setGeneratingUseCases(prev => ({ ...prev, [toolId]: true }));
    try {
      await apiService.generateUseCases(toolId);
      await loadUseCases(toolId);
    } catch (error) {
      console.error('Failed to generate use cases:', error);
      alert('AI Generation failed. Please verify that your LLM settings and API keys are properly configured in Admin -> Security.');
    } finally {
      setGeneratingUseCases(prev => ({ ...prev, [toolId]: false }));
    }
  };

  const handleOpenAddModal = (toolId: number) => {
    setModalToolId(toolId);
    setActiveUseCase(null);
    setModalForm({
      mcp_tool_name: '',
      title: '',
      description: '',
      sample_prompt: '',
      expected_outcome: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tool: Tool, useCase: MCPToolUseCase) => {
    setModalToolId(tool.id);
    setActiveUseCase(useCase);
    setModalForm({
      mcp_tool_name: useCase.mcp_tool_name,
      title: useCase.title,
      description: useCase.description || '',
      sample_prompt: useCase.sample_prompt,
      expected_outcome: useCase.expected_outcome || '',
    });
    setIsModalOpen(true);
  };

  const handleSaveUseCase = async () => {
    if (!modalToolId) return;
    try {
      if (activeUseCase) {
        // Edit mode
        await apiService.updateUseCase(activeUseCase.id, modalForm);
      } else {
        // Add mode
        await apiService.createUseCase(modalToolId, modalForm);
      }
      setIsModalOpen(false);
      await loadUseCases(modalToolId);
    } catch (error) {
      console.error('Failed to save use case:', error);
    }
  };

  const handleDeleteUseCase = async (toolId: number, useCaseId: number) => {
    if (!confirm('Are you sure you want to delete this use case scenario?')) return;
    try {
      await apiService.deleteUseCase(useCaseId);
      await loadUseCases(toolId);
    } catch (error) {
      console.error('Failed to delete use case:', error);
    }
  };

  const handleCopyPrompt = (useCaseId: number, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedUseCaseId(useCaseId);
    setTimeout(() => setCopiedUseCaseId(null), 2000);
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tool</span>
        </button>
      </div>

      {/* Add Tool Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-6 rounded-lg border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Tool</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={newTool.name}
                onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={newTool.type}
                onChange={(e) => setNewTool({ ...newTool, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="mcp">MCP (SSE Endpoint)</option>
                <option value="http">HTTP (MCP Endpoint)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newTool.description}
                onChange={(e) => setNewTool({ ...newTool, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
              <input
                type="text"
                value={newTool.endpoint}
                onChange={(e) => setNewTool({ ...newTool, endpoint: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTool}
              disabled={!newTool.name}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Add Tool
            </button>
          </div>
        </div>
      )}

      {/* Tools List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading tools...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTools.map((tool) => (
            <div key={tool.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{tool.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tool.enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tool.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {tool.type.toUpperCase()}
                    </span>
                  </div>
                  {tool.description && (
                    <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                  )}
                  {tool.endpoint && (
                    <p className="text-xs text-gray-500 mt-1">{tool.endpoint}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePlaybook(tool.id)}
                    className={`flex items-center space-x-1 px-3 py-1.5 font-bold text-xs rounded-lg transition-all border ${
                      activePlaybookToolId === tool.id 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' 
                        : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
                    }`}
                    title="View Scenario Playbook"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Playbook</span>
                    {activePlaybookToolId === tool.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleTestTool(tool.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Test Tool"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingTool(editingTool?.id === tool.id ? null : tool)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit Tool"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTool(tool.id)}
                    className="p-2 text-red-400 hover:text-red-600"
                    title="Delete Tool"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Edit Form */}
              {editingTool?.id === tool.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={editingTool.name}
                        onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                      <select
                        value={editingTool.type}
                        onChange={(e) => setEditingTool({ ...editingTool, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="mcp">MCP (SSE Endpoint)</option>
                        <option value="http">HTTP (MCP Endpoint)</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editingTool.description || ''}
                        onChange={(e) => setEditingTool({ ...editingTool, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Endpoint</label>
                      <input
                        type="text"
                        value={editingTool.endpoint || ''}
                        onChange={(e) => setEditingTool({ ...editingTool, endpoint: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`enabled-${tool.id}`}
                        checked={editingTool.enabled}
                        onChange={(e) => setEditingTool({ ...editingTool, enabled: e.target.checked })}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`enabled-${tool.id}`} className="text-sm font-medium text-gray-700">
                        Enabled
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setEditingTool(null)}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateTool(editingTool)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Test Result */}
              {testResults[tool.id] && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50/20 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                      Test Result
                    </h4>
                    <div className="flex bg-gray-150 p-0.5 rounded-lg border border-gray-200 shadow-inner">
                      <button
                        onClick={() => setTestResultTabs(prev => ({ ...prev, [tool.id]: 'summary' }))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                          (testResultTabs[tool.id] || 'summary') === 'summary'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => setTestResultTabs(prev => ({ ...prev, [tool.id]: 'raw' }))}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                          testResultTabs[tool.id] === 'raw'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        Raw Payload
                      </button>
                    </div>
                  </div>

                  {(testResultTabs[tool.id] || 'summary') === 'summary' ? (
                    <div className="space-y-3">
                      {/* Summary View */}
                      {(() => {
                        const res = testResults[tool.id];
                        const isSuccess = res.status === 'success' || !res.error;
                        const message = res.message || res.error || (isSuccess ? 'Connection test completed successfully' : 'Connection failed');
                        
                        // Metadata fields
                        const serverName = res.discovery?.server_name || res.discovery?.session_info?.serverInfo?.name || "Generic MCP Server";
                        const serverVersion = res.discovery?.session_info?.serverInfo?.version || "1.0.0";
                        const protocolVersion = res.discovery?.session_info?.protocolVersion || "N/A";
                        
                        // Extract discovered tools
                        const toolsDiscovered = (() => {
                          const discResults = res.discovery?.discovery_results;
                          if (discResults) {
                            for (const key of Object.keys(discResults)) {
                              const tools = discResults[key]?.response?.result?.tools;
                              if (Array.isArray(tools)) return tools;
                            }
                          }
                          if (Array.isArray(res.discovery?.tools)) return res.discovery.tools;
                          if (Array.isArray(res.tools)) return res.tools;
                          return [];
                        })();

                        return (
                          <div className="bg-white rounded-xl border border-gray-150 p-4 space-y-4 shadow-sm">
                            {/* Status banner */}
                            <div className={`flex items-start gap-3 p-3 rounded-lg ${
                              isSuccess ? 'bg-emerald-50/70 border border-emerald-100 text-emerald-800' : 'bg-rose-50/70 border border-rose-100 text-rose-800'
                            }`}>
                              {isSuccess ? (
                                <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              )}
                              <div>
                                <h5 className="font-bold text-sm">
                                  {isSuccess ? 'Connection & Discovery Successful' : 'Connection Failed'}
                                </h5>
                                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{message}</p>
                              </div>
                            </div>

                            {isSuccess && (
                              <>
                                {/* Server details grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50/60 p-3 rounded-lg border border-gray-100 text-xs">
                                  <div>
                                    <span className="text-gray-400 block mb-0.5 uppercase tracking-wider font-bold text-[10px]">Server Name</span>
                                    <strong className="text-gray-700 font-bold">{serverName}</strong>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block mb-0.5 uppercase tracking-wider font-bold text-[10px]">Server Version</span>
                                    <strong className="text-gray-700 font-bold">{serverVersion}</strong>
                                  </div>
                                  <div>
                                    <span className="text-gray-400 block mb-0.5 uppercase tracking-wider font-bold text-[10px]">Protocol Version</span>
                                    <strong className="text-gray-700 font-bold">{protocolVersion}</strong>
                                  </div>
                                </div>

                                {/* Discovered Tools list */}
                                <div>
                                  <h6 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a2 2 0 002 2h3a2 2 0 012 2v3a2 2 0 01-2 2h-1a2 2 0 00-2 2v1a2 2 0 01-2 2H9a2 2 0 01-2-2v-1a2 2 0 00-2-2H3a2 2 0 01-2-2V9a2 2 0 012-2h1a2 2 0 002-2V4a2 2 0 012-2h3z" />
                                    </svg>
                                    Discovered Capabilities ({toolsDiscovered.length})
                                  </h6>

                                  {toolsDiscovered.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-dashed border-gray-200">
                                      No specific tools were exposed in the discovery schema.
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {toolsDiscovered.map((mcpTool: any, tIdx: number) => {
                                        const requiredParams = mcpTool.inputSchema?.required || [];
                                        const properties = mcpTool.inputSchema?.properties || {};
                                        const propertiesKeys = Object.keys(properties);

                                        return (
                                          <div key={tIdx} className="p-3 bg-gray-50/50 rounded-xl border border-gray-150 flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono text-xs font-bold rounded-md">
                                                {mcpTool.name}
                                              </span>
                                              <span className="text-[11px] text-gray-400 font-mono">
                                                {propertiesKeys.length} parameter{propertiesKeys.length === 1 ? '' : 's'}
                                              </span>
                                            </div>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                              {mcpTool.description || 'No description available.'}
                                            </p>

                                            {/* Parameters table */}
                                            {propertiesKeys.length > 0 && (
                                              <div className="mt-1.5 border border-gray-150 rounded-lg overflow-hidden bg-white shadow-sm">
                                                <div className="bg-gray-50 border-b border-gray-150 px-3 py-1.5 grid grid-cols-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                  <span>Parameter</span>
                                                  <span>Type</span>
                                                  <span className="text-right">Requirement</span>
                                                </div>
                                                <div className="divide-y divide-gray-100">
                                                  {propertiesKeys.map((pKey: string) => {
                                                    const pVal = properties[pKey];
                                                    const isRequired = requiredParams.includes(pKey);
                                                    return (
                                                      <div key={pKey} className="px-3 py-1.5 grid grid-cols-3 text-xs">
                                                        <span className="font-mono text-gray-700 font-bold">{pKey}</span>
                                                        <span className="text-gray-500 font-mono text-[11px]">
                                                          {pVal.type || 'any'}
                                                          {pVal.enum && ' (enum)'}
                                                        </span>
                                                        <span className="text-right shrink-0">
                                                          {isRequired ? (
                                                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 border border-amber-100 font-bold rounded">Required</span>
                                                          ) : (
                                                            <span className="px-1.5 py-0.5 text-[10px] bg-gray-50 text-gray-500 border border-gray-100 font-medium rounded">Optional</span>
                                                          )}
                                                        </span>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Raw JSON View */
                    <pre className="bg-gray-900 p-4 rounded-xl text-xs overflow-x-auto text-emerald-400 font-mono border border-gray-200 shadow-inner max-h-[400px]">
                      {JSON.stringify(testResults[tool.id], null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Playbook Collapsible Panel */}
              {activePlaybookToolId === tool.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/70 p-4 rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Use Case Playbook
                      </h4>
                      <p className="text-xs text-gray-500">Discover and execute scenario prompt templates targeting this tool.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleGenerateUseCases(tool.id)}
                        disabled={generatingUseCases[tool.id]}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{generatingUseCases[tool.id] ? 'Generating...' : 'Generate with AI'}</span>
                      </button>
                      <button
                        onClick={() => handleOpenAddModal(tool.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-lg shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Manual</span>
                      </button>
                    </div>
                  </div>

                  {loadingUseCases[tool.id] ? (
                    <div className="flex items-center justify-center py-8 text-gray-500 text-xs font-semibold">
                      <Loader2 className="w-4 h-4 text-indigo-500 animate-spin mr-2" />
                      Loading playbook scenarios...
                    </div>
                  ) : !usecases[tool.id] || usecases[tool.id].length === 0 ? (
                    <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-xl px-4">
                      <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm font-bold text-gray-700">No Playbook Scenarios Defined</p>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                        Let AI discover the underlying JSON capability schemas of this tool and draft realistic testing use cases instantly!
                      </p>
                      <button
                        onClick={() => handleGenerateUseCases(tool.id)}
                        disabled={generatingUseCases[tool.id]}
                        className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs rounded-lg shadow transition-all disabled:opacity-50"
                      >
                        {generatingUseCases[tool.id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span>{generatingUseCases[tool.id] ? 'Generating Use Cases...' : 'Generate Use Cases with AI'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {usecases[tool.id].map((uc) => (
                        <div key={uc.id} className="group relative bg-white hover:bg-indigo-50/5 border border-gray-150 hover:border-indigo-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 uppercase font-mono tracking-wide">
                              {uc.mcp_tool_name}
                            </span>
                            <div className="flex items-center space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEditModal(tool, uc)}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
                                title="Edit Scenario"
                              >
                                <Settings className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteUseCase(tool.id, uc.id)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                title="Delete Scenario"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <h5 className="text-sm font-bold text-gray-900 mb-1">{uc.title}</h5>
                          {uc.description && (
                            <p className="text-xs text-gray-600 mb-3 leading-relaxed">{uc.description}</p>
                          )}

                          <div className="mt-2.5 bg-gray-50 border border-gray-100 rounded-lg p-2.5 relative font-mono text-[11px] text-gray-700 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
                            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              <span>Sample Prompt</span>
                              <button
                                onClick={() => handleCopyPrompt(uc.id, uc.sample_prompt)}
                                className="text-gray-400 hover:text-indigo-600 p-0.5 hover:bg-indigo-50 rounded transition-colors"
                                title="Copy prompt to clipboard"
                              >
                                {copiedUseCaseId === uc.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap select-all">{uc.sample_prompt}</p>
                          </div>

                          {uc.expected_outcome && (
                            <div className="mt-3 text-[11px] text-gray-500 leading-relaxed bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
                              <strong className="text-gray-600 font-bold">Expected Outcome: </strong>{uc.expected_outcome}
                            </div>
                          )}

                          <div className="mt-4">
                            <button
                              onClick={() => onTryInChat && onTryInChat(uc.sample_prompt)}
                              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-1"
                            >
                              <Play className="w-3 h-3" />
                              <span>Try in Chat Sandbox 🧪</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {filteredTools.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No tools found</p>
        </div>
      )}

      {/* Manual Use Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden transform transition-all duration-300">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="text-md font-bold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {activeUseCase ? 'Edit Playbook Scenario' : 'Add Playbook Scenario'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full w-6 h-6 flex items-center justify-center transition-all text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Specific Function / MCP Tool Name</label>
                <input
                  type="text"
                  placeholder="e.g. read_file, execute_query, or leave empty if same as server"
                  value={modalForm.mcp_tool_name}
                  onChange={(e) => setModalForm({ ...modalForm, mcp_tool_name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Scenario Title</label>
                <input
                  type="text"
                  placeholder="e.g. Read and Summarize Corporate Report"
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Business Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly explain the business context and goals..."
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sample Chat Prompt</label>
                <textarea
                  rows={3}
                  placeholder="What should the user prompt the AI agent with to trigger this tool?"
                  value={modalForm.sample_prompt}
                  onChange={(e) => setModalForm({ ...modalForm, sample_prompt: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expected Outcome</label>
                <input
                  type="text"
                  placeholder="What is the expected resulting response or tool action?"
                  value={modalForm.expected_outcome}
                  onChange={(e) => setModalForm({ ...modalForm, expected_outcome: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
            </div>
            <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUseCase}
                disabled={!modalForm.title || !modalForm.sample_prompt}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-md"
              >
                Save Use Case
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ToolManager;
