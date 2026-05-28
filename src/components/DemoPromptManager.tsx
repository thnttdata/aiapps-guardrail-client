import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Tag, ShieldAlert, Cpu, Layers, Sparkles, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DemoPrompt, DemoPromptCreate, DemoPromptUpdate } from '../types';
import { apiService } from '../services/api';

const DemoPromptManager: React.FC = () => {
  const [prompts, setPrompts] = useState<DemoPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<DemoPrompt | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const categories = ['general', 'security', 'tools', 'rag', 'malicious'];

  useEffect(() => {
    loadPrompts();
  }, [selectedCategory]);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDemoPrompts(selectedCategory || undefined);
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
      setMessage({ type: 'error', text: 'Failed to load demo prompts' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (promptData: DemoPromptCreate) => {
    try {
      await apiService.createDemoPrompt(promptData);
      await loadPrompts();
      setIsCreating(false);
      setMessage({ type: 'success', text: 'Demo prompt created successfully' });
    } catch (error) {
      console.error('Failed to create prompt:', error);
      setMessage({ type: 'error', text: 'Failed to create demo prompt' });
    }
  };

  const handleUpdate = async (id: number, promptData: DemoPromptUpdate) => {
    try {
      await apiService.updateDemoPrompt(id, promptData);
      await loadPrompts();
      setEditingPrompt(null);
      setMessage({ type: 'success', text: 'Demo prompt updated successfully' });
    } catch (error) {
      console.error('Failed to update prompt:', error);
      setMessage({ type: 'error', text: 'Failed to update demo prompt' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this demo prompt?')) return;
    
    try {
      await apiService.deleteDemoPrompt(id);
      await loadPrompts();
      setMessage({ type: 'success', text: 'Demo prompt deleted successfully' });
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      setMessage({ type: 'error', text: 'Failed to delete demo prompt' });
    }
  };

  // Clear message after 4 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const filteredPrompts = prompts.filter(prompt => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      prompt.title.toLowerCase().includes(query) ||
      prompt.content.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, itemsPerPage]);

  // Pagination calculations
  const totalItems = filteredPrompts.length;
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage);
  
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedPrompts = itemsPerPage === -1 
    ? filteredPrompts 
    : filteredPrompts.slice(startIndex, endIndex);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg text-gray-800 overflow-hidden relative">
      {/* Decorative subtle ambient gradient in light theme */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-500/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold tracking-wide text-gray-900">
              Demo Prompt Management
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure premium prefilled prompts, active security test cases, and Guardrail stress-tests.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5px]" />
          <span>Add Prompt</span>
        </button>
      </div>

      {/* Message Notifications */}
      {message && (
        <div className={`flex items-center space-x-3 p-4 rounded-xl border mb-6 animate-fadeIn transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Controls & Filter toolbar */}
      <div className="relative flex flex-col sm:flex-row gap-4 mb-6 z-10">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Search prompts, categories, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all duration-200"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 cursor-pointer min-w-[160px] transition-all duration-200"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Prompts Premium Table Container */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
          <span className="text-sm text-gray-500 animate-pulse">Retrieving showroom payloads...</span>
        </div>
      ) : (
        <div className="relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Prompt Title</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Category</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 w-[35%]">Payload Preview</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Usage</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Tags</th>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedPrompts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center space-y-2">
                        <Layers className="w-8 h-8 text-gray-400" />
                        <span className="text-sm font-medium">
                          {searchQuery ? 'No prompts match your search.' : 'No demo prompts found.'}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPrompts.map((prompt) => (
                    <tr 
                      key={prompt.id} 
                      className="group hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* Prompt Title & Indicators */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2.5">
                          {prompt.is_malicious ? (
                            <div className="flex-shrink-0 bg-rose-50 p-1.5 rounded-lg border border-rose-100" title="Malicious Payload">
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
                            </div>
                          ) : (
                            <div className="flex-shrink-0 bg-amber-50 p-1.5 rounded-lg border border-amber-100" title="Safe / Standard Prompt">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-800 group-hover:text-black transition-colors duration-150 block truncate max-w-[200px]" title={prompt.title}>
                              {prompt.title}
                            </span>
                            {prompt.preferred_llm && (
                              <span className="inline-flex items-center space-x-1 text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded-md mt-1">
                                <Cpu className="w-2.5 h-2.5" />
                                <span>{prompt.preferred_llm.split('/').pop()?.replace(/-/g, ' ')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border uppercase ${
                          prompt.category === 'security' || prompt.category === 'malicious'
                            ? 'bg-rose-50 text-rose-600 border-rose-100' 
                            : prompt.category === 'tools' 
                            ? 'bg-blue-50 text-blue-600 border-blue-100' 
                            : prompt.category === 'rag' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {prompt.category}
                        </span>
                      </td>

                      {/* Content Preview */}
                      <td className="px-5 py-4">
                        <div 
                          className="text-sm text-gray-500 group-hover:text-gray-700 line-clamp-2 leading-relaxed transition-colors duration-150 cursor-help" 
                          title={prompt.content}
                        >
                          {prompt.content}
                        </div>
                      </td>

                      {/* Usage Count */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md font-medium text-gray-600">
                            {prompt.usage_count}
                          </span>
                          <span className="text-[10px] text-gray-400">runs</span>
                        </div>
                      </td>

                      {/* Tags */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {prompt.tags.length > 0 ? (
                            prompt.tags.map((tag) => (
                              <span 
                                key={tag} 
                                className="inline-flex items-center space-x-1 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-md transition-colors duration-150"
                              >
                                <Tag className="w-2 h-2" />
                                <span>{tag}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400 italic">-</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end items-center space-x-1">
                          <button
                            onClick={() => setEditingPrompt(prompt)}
                            title="Edit Prompt"
                            className="p-1.5 bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 rounded-lg border border-gray-200 hover:border-amber-200 transition-all duration-150"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prompt.id)}
                            title="Delete Prompt"
                            className="p-1.5 bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-lg border border-gray-200 hover:border-rose-200 transition-all duration-150"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Premium Footer with Pagination & Items Per Page Selection */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-5 py-4 bg-gray-50 border-t border-gray-200 gap-4">
            {/* Range info */}
            <div className="text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
              <span className="font-semibold text-gray-700">{endIndex}</span> of{' '}
              <span className="font-semibold text-gray-700">{totalItems}</span> prompts
            </div>

            {/* Pagination Controls & Page Size */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Items Per Page Selector */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={-1}>All</option>
                </select>
                <span>per page</span>
              </div>

              {/* Prev / Next buttons */}
              {itemsPerPage !== -1 && totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border ${
                          currentPage === pageNum
                            ? 'bg-amber-500 text-black border-amber-500 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal (Light Mode styling matching modern premium look) */}
      {(isCreating || editingPrompt) && (
        <PromptForm
          prompt={editingPrompt}
          onSave={editingPrompt ? (data) => handleUpdate(editingPrompt.id, data) : handleCreate}
          onCancel={() => {
            setIsCreating(false);
            setEditingPrompt(null);
          }}
        />
      )}
    </div>
  );
};

interface PromptFormProps {
  prompt?: DemoPrompt | null;
  onSave: (data: DemoPromptCreate) => void;
  onCancel: () => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ prompt, onSave, onCancel }) => {
  const [formData, setFormData] = useState<DemoPromptCreate>({
    title: prompt?.title || '',
    content: prompt?.content || '',
    category: prompt?.category || 'general',
    tags: prompt?.tags || [],
    is_malicious: prompt?.is_malicious || false,
    preferred_llm: prompt?.preferred_llm ?? undefined,
  });

  const [tagInput, setTagInput] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    apiService.getModels().then((res) => setAvailableModels(res.models || [])).catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;
    onSave({
      ...formData,
      preferred_llm: formData.preferred_llm || null,
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-gray-800 relative">
        {/* Subtle top decoration */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold tracking-wide text-gray-900">
            {prompt ? 'Edit Showroom Prompt' : 'Create Showroom Prompt'}
          </h3>
          <button 
            type="button" 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors text-lg"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Prompt Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Prompt Leakage Stress-Test"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Payload / Core Prompt Content
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              placeholder="Enter the prompt content used by the chatbot..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono text-sm leading-relaxed"
              required
            />
          </div>

          {/* Category & Malicious Checkbox */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                <option value="general">General</option>
                <option value="security">Security</option>
                <option value="tools">Tools</option>
                <option value="rag">RAG</option>
                <option value="malicious">Malicious</option>
              </select>
            </div>

            <div className="flex items-center mt-6">
              <label className="relative flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="is_malicious"
                  checked={formData.is_malicious}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_malicious: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
                <span className="ml-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Mark as malicious threat
                </span>
              </label>
            </div>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Preferred LLM Core (Optional)
            </label>
            <select
              value={formData.preferred_llm ?? ''}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_llm: e.target.value || undefined }))}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              <option value="">None (Uses current active model)</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              When triggered in the chatbot interface, the workspace will auto-transition to this model for demonstration purposes.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Metadata Tags
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g. jailbreak, bypass"
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-450 focus:outline-none focus:border-amber-500/50 transition-all"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs rounded-lg font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-amber-700/60 hover:text-amber-700 text-sm focus:outline-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent hover:border-gray-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold rounded-xl shadow-md transition-all transform hover:scale-[1.01]"
            >
              {prompt ? 'Save Changes' : 'Create Prompt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemoPromptManager;
