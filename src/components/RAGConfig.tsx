import React from 'react';
import { AppConfig } from '../types';
import UploadDropzone from './UploadDropzone';
import RagManagement, { RagManagementRef } from './RagManagement';

interface RAGConfigProps {
  config: AppConfig | null;
  ragScanningProgress: {
    isScanning: boolean;
    filename?: string;
    current: number;
    total: number;
  } | null;
  startProgressPolling: () => void;
  loadRagScanningResult: () => void;
  ragManagementRef: React.RefObject<RagManagementRef>;
  setIsGenerateModalOpen: (open: boolean) => void;
  setMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>>;
}

const RAGConfig: React.FC<RAGConfigProps> = ({
  config: _config,
  ragScanningProgress,
  startProgressPolling,
  loadRagScanningResult,
  ragManagementRef,
  setIsGenerateModalOpen,
  setMessage
}) => {
  return (
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
  );
};

export default RAGConfig;
