import React from 'react';
import { AppConfig } from '../types';

interface RAGSecurityAuditProps {
  config: AppConfig;
  ragScanningResult: any;
  loadRagScanningResult: () => void;
  setMessage: React.Dispatch<React.SetStateAction<{ type: 'success' | 'error'; text: string } | null>>;
}

const RAGSecurityAudit: React.FC<RAGSecurityAuditProps> = ({
  config,
  ragScanningResult,
  loadRagScanningResult,
  setMessage: _setMessage
}) => {
  return (
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
  );
};

export default RAGSecurityAudit;
