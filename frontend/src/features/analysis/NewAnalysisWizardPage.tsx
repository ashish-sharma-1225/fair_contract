import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Play,
  ArrowRight,
  ArrowLeft,
  Info,
  Clock,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { FileDropzone } from '../../components/forms/FileDropzone';
import { RuleTypeBadge } from '../../components/ui/StatusBadge';
import { demoStore } from '../../mocks/demo-store';
import { mockSampleContractText } from '../../mocks/demo-data';
import { formatBytes, truncateHash } from '../../lib/utils';
import type { Contract, Policy, RegulatoryRule } from '../../types';

export function NewAnalysisWizardPage() {
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string>('');

  // Policies and Regulatory Rules selection
  const [policies] = useState<Policy[]>(() =>
    demoStore.getPolicies()
  );
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(() =>
    demoStore.getPolicies().filter(p => p.is_enabled).map(p => p.id)
  );

  const [regulatoryRules] = useState<RegulatoryRule[]>(() =>
    demoStore.getRegulatoryRules()
  );
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(() =>
    demoStore.getRegulatoryRules().filter(r => r.is_selected).map(r => r.id)
  );


  // Analysis simulation state
  const [analyzingStage, setAnalyzingStage] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Extracted preview page index
  const [previewPageIndex, setPreviewPageIndex] = useState<number>(0);

  const handleFileSelect = (file: File, sha256: string) => {
    setSelectedFile(file);
    setFileSha256(sha256);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileSha256('');
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

  // Run the realistic analysis simulation
  const startAnalysis = () => {
    if (!selectedFile) return;

    setCurrentStep(5); // Go to progress screen
    setAnalyzingStage(1);
    setProgressPercent(15);

    // Step 1: Validating integrity
    setTimeout(() => {
      setAnalyzingStage(2);
      setProgressPercent(35);

      // Step 2: Extraction
      setTimeout(() => {
        setAnalyzingStage(3);
        setProgressPercent(60);

        // Step 3: Rules matching
        setTimeout(() => {
          setAnalyzingStage(4);
          setProgressPercent(85);

          // Step 4: AI Analysis & Quote Verification
          setTimeout(() => {
            setAnalyzingStage(5);
            setProgressPercent(100);

            // Create contract entity
            const contractId = `ctr_uploaded_${Date.now()}`;
            const contractRecord: Contract = {
              id: contractId,
              owner_id: 'usr_demo_8829',
              filename_original: selectedFile.name,
              storage_key: `private_uploads/${contractId}.pdf`,
              sha256:
                fileSha256 ||
                'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
              mime_type: 'application/pdf',
              size_bytes: selectedFile.size,
              page_count: mockSampleContractText.page_count,
              status: 'analyzing',
              uploaded_at: new Date().toISOString(),
              deleted_at: null,
            };

            const completedAnalysis = demoStore.createSimulatedAnalysis(
              contractRecord,
              selectedPolicyIds,
              selectedRuleIds
            );

            // Redirect to results after brief completion pause
            setTimeout(() => {
              navigate(`/analyses/${completedAnalysis.id}`);
            }, 800);
          }, 1200);
        }, 1000);
      }, 1000);
    }, 900);
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
        title="Analyze Contract"
        description="Select a contract PDF and evaluate against verified regulatory rules and business policies."
        backTo="/dashboard"
        backLabel="Return to Dashboard"
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

      {/* Step 1: Upload */}
      {currentStep === 1 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Step 1: Upload Contract PDF</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or drop your PDF contract for text extraction and risk analysis.
            </p>
          </div>

          <FileDropzone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            fileSha256={fileSha256}
            onClearFile={handleClearFile}
          />

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {selectedFile ? 'PDF ready for text extraction' : 'Select a contract or demo sample to continue'}
            </span>

            <Button
              variant="primary"
              size="sm"
              disabled={!selectedFile}
              onClick={() => setCurrentStep(2)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Next: Text preview
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Extraction Preview */}
      {currentStep === 2 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Step 2: Extracted Text Preview</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect extracted text from the document before running analysis.
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Extraction preview
            </span>
          </div>

          {/* Extracted Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Filename</span>
              <span className="font-medium text-slate-800 truncate block">
                {selectedFile?.name}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Pages</span>
              <span className="font-medium text-slate-800">
                {mockSampleContractText.page_count} pages
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Clauses Detected</span>
              <span className="font-medium text-slate-800">
                18 clauses
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">SHA-256</span>
              <span className="font-mono text-slate-600 block truncate">
                {truncateHash(fileSha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b')}
              </span>
            </div>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 mr-1">Pages:</span>
            {mockSampleContractText.pages.map((p, idx) => (
              <button
                key={p.page_number}
                type="button"
                onClick={() => setPreviewPageIndex(idx)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  previewPageIndex === idx
                    ? 'bg-slate-800 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Page {p.page_number}
              </button>
            ))}
          </div>

          {/* Text Preview Window */}
          <div className="rounded border border-slate-200 bg-slate-50 text-slate-800 p-4 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
            {mockSampleContractText.pages[previewPageIndex]?.text}
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
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Step 3: Select Regulatory Rules & Policies</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the legal rules and business policies to evaluate against this document.
            </p>
          </div>

          {/* Regulatory Rules Section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Statutory and Regulatory Rules
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
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        Source: {rule.source?.title}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* User Policies Section */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              User Business Policies
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
              Back to preview
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={selectedRuleIds.length === 0 && selectedPolicyIds.length === 0}
              onClick={() => setCurrentStep(4)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Next: Review configuration
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review Configuration */}
      {currentStep === 4 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Step 4: Confirm Analysis Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review document parameters before launching automated clause evaluation.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Selected File</span>
                <span className="font-medium text-slate-900 block mt-0.5">
                  {selectedFile?.name}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {formatBytes(selectedFile?.size || 0)} · {mockSampleContractText.page_count} pages
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Integrity Hash</span>
                <span className="font-mono text-slate-700 text-xs block mt-0.5">
                  {truncateHash(fileSha256 || '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b')}
                </span>
                <span className="text-emerald-700 text-[11px] font-medium flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  SHA-256 verified
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 flex flex-wrap gap-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[11px]">Regulatory Rules</span>
                <span className="font-medium text-slate-900">
                  {selectedRuleIds.length} rule frameworks selected
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Business Policies</span>
                <span className="font-medium text-slate-900">
                  {selectedPolicyIds.length} custom policies active
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Analysis Engine</span>
                <span className="font-medium text-slate-900">
                  Local Simulation Engine
                </span>
              </div>
            </div>
          </div>

          {/* Legal disclaimer notice */}
          <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Review assistance only. Findings are potential issues for human review, not legal advice.
            </span>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(3)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Back to rules
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={startAnalysis}
              leftIcon={<Play className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Start contract analysis
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Realistic Progress UI */}
      {currentStep === 5 && (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Analyzing Contract Clauses
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Executing staged document validation, rule alignment, and evidence quotation verification.
            </p>
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
              <span>Simulation mode</span>
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
