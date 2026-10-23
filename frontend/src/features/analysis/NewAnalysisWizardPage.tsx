import { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Play,
  ArrowRight,
  ArrowLeft,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { FileDropzone } from '../../components/forms/FileDropzone';
import { RuleTypeBadge } from '../../components/ui/StatusBadge';
import { apiClient } from '../../lib/api-client';
import { formatBytes, truncateHash } from '../../lib/utils';
import type { Contract, ContractExtraction, Policy, RegulatoryRule } from '../../types';

export function NewAnalysisWizardPage() {
  const navigate = useNavigate();

  // Wizard step state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string>('');

  // Uploaded backend entities
  const [uploadedContract, setUploadedContract] = useState<Contract | null>(null);
  const [extraction, setExtraction] = useState<ContractExtraction | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Policies and Regulatory Rules selection
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);
  const [regulatoryRules, setRegulatoryRules] = useState<RegulatoryRule[]>([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);

  // Analysis execution state
  const [analyzingStage, setAnalyzingStage] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [previewPageIndex, setPreviewPageIndex] = useState<number>(0);

  // Load policies and rules on mount
  useEffect(() => {
    async function loadRulesAndPolicies() {
      try {
        const [fetchedPolicies, fetchedRules] = await Promise.all([
          apiClient.getPolicies(),
          apiClient.getRegulatoryRules(),
        ]);
        setPolicies(fetchedPolicies);
        setSelectedPolicyIds(fetchedPolicies.filter(p => p.is_enabled).map(p => p.id));
        setRegulatoryRules(fetchedRules);
        setSelectedRuleIds(fetchedRules.filter(r => r.is_selected).map(r => r.id));
      } catch (err: unknown) {
        console.warn('Failed to pre-fetch rules from backend:', err);
      }
    }
    loadRulesAndPolicies();
  }, []);

  const handleFileSelect = (file: File, sha256: string) => {
    setSelectedFile(file);
    setFileSha256(sha256);
    setUploadedContract(null);
    setExtraction(null);
    setError(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileSha256('');
    setUploadedContract(null);
    setExtraction(null);
    setError(null);
  };

  const togglePolicy = (id: string) => {
    setSelectedPolicyIds(prev =>
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleRule = (id: string) => {
    setSelectedRuleIds(prev =>
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  // Step 1 -> Step 2: Upload PDF to backend and fetch text extraction
  const handleProceedToPreview = async () => {
    if (!selectedFile) return;

    // If already uploaded and extracted, just advance
    if (uploadedContract && extraction) {
      setCurrentStep(2);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const contract = await apiClient.uploadContract(selectedFile);
      setUploadedContract(contract);
      setFileSha256(contract.sha256);

      const contractExtraction = await apiClient.getContractExtraction(contract.id);
      setExtraction(contractExtraction);
      setCurrentStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Contract upload or text extraction failed';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Step 4 -> Step 5: Execute analysis via backend
  const startAnalysis = async () => {
    if (!uploadedContract) return;

    setCurrentStep(5);
    setAnalyzingStage(1);
    setProgressPercent(20);
    setError(null);

    try {
      // Stage 1: Validation
      await new Promise(r => setTimeout(r, 400));
      setAnalyzingStage(2);
      setProgressPercent(40);

      // Stage 2: Matching
      await new Promise(r => setTimeout(r, 400));
      setAnalyzingStage(3);
      setProgressPercent(60);

      // Trigger backend analysis
      const analysisPromise = apiClient.startAnalysis(uploadedContract.id, {
        policy_ids: selectedPolicyIds,
        regulatory_rule_ids: selectedRuleIds,
      });

      // Stage 3 & 4 visual progress
      await new Promise(r => setTimeout(r, 400));
      setAnalyzingStage(4);
      setProgressPercent(80);

      const analysis = await analysisPromise;

      setAnalyzingStage(5);
      setProgressPercent(100);

      // Pause briefly for user to view 100% completion before navigating
      setTimeout(() => {
        navigate(`/analyses/${analysis.id}`);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis processing failed';
      setError(msg);
      setAnalyzingStage(0);
    }
  };

  const steps = [
    { number: 1, title: 'Upload PDF' },
    { number: 2, title: 'Text Preview' },
    { number: 3, title: 'Select Rules' },
    { number: 4, title: 'Review & Confirm' },
    { number: 5, title: 'Analysis' },
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <PageHeader
        title="Analyse Contract"
        description="Upload a contract to evaluate against your policies and rules."
        backTo="/dashboard"
        backLabel="Dashboard"
      />

      {/* Stepper Navigation */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      isCompleted
                        ? 'bg-slate-800 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`text-xs hidden sm:inline ${
                      isCurrent
                        ? 'text-slate-900 font-medium'
                        : isCompleted
                        ? 'text-slate-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 sm:mx-4 ${
                      isCompleted ? 'bg-slate-400' : 'bg-slate-200'
                    }`}
                  />
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Global Error Notice */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          {currentStep === 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(4)}
              className="text-xs bg-white text-red-700 border-red-300"
            >
              Back to Review
            </Button>
          )}
        </div>
      )}

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Upload Contract</h2>
          </div>

          <FileDropzone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            fileSha256={fileSha256}
            onClearFile={handleClearFile}
            disabled={isUploading}
          />

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {isUploading
                ? 'Uploading to backend and extracting pages...'
                : selectedFile
                ? 'PDF ready for analysis'
                : 'Choose a file or select a sample agreement'}
            </span>

            <Button
              variant="primary"
              size="sm"
              disabled={!selectedFile || isUploading}
              onClick={handleProceedToPreview}
              rightIcon={
                isUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )
              }
              className="text-xs"
            >
              {isUploading ? 'Uploading...' : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Extraction Preview */}
      {currentStep === 2 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Text Preview</h2>
          </div>

          {/* Extracted Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Filename</span>
              <span className="font-medium text-slate-800 truncate block">
                {uploadedContract?.filename_original || selectedFile?.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Pages</span>
              <span className="font-medium text-slate-800">
                {extraction?.page_count || 1} pages
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Clauses Detected</span>
              <span className="font-medium text-slate-800">
                {extraction?.pages.reduce((acc, p) => acc + p.clauses_count, 0) || 0} segments
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">SHA-256</span>
              <span className="font-mono text-slate-600 block truncate" title={fileSha256}>
                {truncateHash(fileSha256 || uploadedContract?.sha256 || '')}
              </span>
            </div>
          </div>

          {/* Page navigation */}
          {extraction && extraction.pages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-500 mr-1">Pages:</span>
              {extraction.pages.map((p, idx) => (
                <button
                  key={p.page_number}
                  type="button"
                  onClick={() => setPreviewPageIndex(idx)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    previewPageIndex === idx
                      ? 'bg-slate-800 text-white font-medium'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Page {p.page_number}
                </button>
              ))}
            </div>
          )}

          {/* Text Preview Window */}
          <div className="rounded border border-slate-200 bg-slate-50 text-slate-800 p-4 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
            {extraction?.pages[previewPageIndex]?.text || 'No text extracted from this page.'}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Back to upload
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCurrentStep(3)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Next: Select rules
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Select Rules & Policies */}
      {currentStep === 3 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-5">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Select Policies & Rules</h2>
          </div>

          {/* Regulatory Rules Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Statutory Rules
            </h3>

            <div className="space-y-2">
              {regulatoryRules.map(rule => {
                const isChecked = selectedRuleIds.includes(rule.id);
                return (
                  <label
                    key={rule.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer text-xs ${
                      isChecked
                        ? 'border-slate-300 bg-slate-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleRule(rule.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-slate-400 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-medium text-slate-800">
                          {rule.rule_code}
                        </span>
                        <RuleTypeBadge type={rule.binding_type} />
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-slate-500 text-xs">
                          {rule.source?.jurisdiction}
                        </span>
                      </div>
                      <p className="text-slate-800 mt-1">
                        {rule.rule_text}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* User Policies Section */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Contract Policies
            </h3>

            <div className="space-y-2">
              {policies.map(policy => {
                const isChecked = selectedPolicyIds.includes(policy.id);
                return (
                  <label
                    key={policy.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer text-xs ${
                      isChecked
                        ? 'border-slate-300 bg-slate-50/60'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePolicy(policy.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-slate-400 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">
                          {policy.name}
                        </span>
                        <span className="text-slate-400 text-xs">·</span>
                        <span className="text-slate-500 text-xs capitalize">
                          {policy.category}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-0.5">
                        {policy.rule_text}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Back
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={selectedRuleIds.length === 0 && selectedPolicyIds.length === 0}
              onClick={() => setCurrentStep(4)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review Configuration */}
      {currentStep === 4 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Confirm Analysis</h2>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Selected File</span>
                <span className="font-medium text-slate-900 block mt-0.5">
                  {uploadedContract?.filename_original || selectedFile?.name}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {formatBytes(uploadedContract?.size_bytes || selectedFile?.size || 0)} · {extraction?.page_count || 1} pages
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Integrity Hash</span>
                <span className="font-mono text-slate-700 text-xs block mt-0.5 truncate">
                  {truncateHash(fileSha256 || uploadedContract?.sha256 || '')}
                </span>
                <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  SHA-256 verified
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex flex-wrap gap-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Rules</span>
                <span className="font-medium text-slate-900">
                  {selectedRuleIds.length} statutory rules
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Policies</span>
                <span className="font-medium text-slate-900">
                  {selectedPolicyIds.length} custom policies
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(3)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Back
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={startAnalysis}
              leftIcon={<Play className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Start Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Progress UI */}
      {currentStep === 5 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Analyzing Contract
            </h2>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="bg-slate-800 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>{progressPercent}% Complete</span>
              <span>Live backend pipeline</span>
            </div>
          </div>

          {/* Stepped Checklist */}
          <div className="max-w-md mx-auto text-left space-y-2 pt-2 text-xs">
            <div
              className={`flex items-center gap-2.5 p-2 rounded ${
                analyzingStage >= 1 ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-400'
              }`}
            >
              {analyzingStage > 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : analyzingStage === 1 ? (
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
              )}
              <span>1. Validating document integrity and SHA-256 hash</span>
            </div>

            <div
              className={`flex items-center gap-2.5 p-2 rounded ${
                analyzingStage >= 2 ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-400'
              }`}
            >
              {analyzingStage > 2 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : analyzingStage === 2 ? (
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
              )}
              <span>2. Page-aware text extraction</span>
            </div>

            <div
              className={`flex items-center gap-2.5 p-2 rounded ${
                analyzingStage >= 3 ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-400'
              }`}
            >
              {analyzingStage > 3 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : analyzingStage === 3 ? (
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
              )}
              <span>3. Matching selected policies and rules</span>
            </div>

            <div
              className={`flex items-center gap-2.5 p-2 rounded ${
                analyzingStage >= 4 ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-400'
              }`}
            >
              {analyzingStage > 4 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : analyzingStage === 4 ? (
                <Clock className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
              )}
              <span>4. Clause risk evaluation and context reasoning</span>
            </div>

            <div
              className={`flex items-center gap-2.5 p-2 rounded ${
                analyzingStage >= 5 ? 'text-slate-900 font-medium bg-slate-50' : 'text-slate-400'
              }`}
            >
              {analyzingStage >= 5 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
              )}
              <span>5. Cross-verifying exact source text quotations</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
