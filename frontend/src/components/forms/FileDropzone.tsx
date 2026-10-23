import { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Sparkles, Hash, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { computeFileSha256, formatBytes, truncateHash } from '../../lib/utils';
import { validatePdfFile } from '../../lib/validation';


export interface FileDropzoneProps {
  onFileSelect: (file: File, sha256: string, isSample?: boolean) => void;
  selectedFile: File | null;
  fileSha256?: string;
  onClearFile: () => void;
  disabled?: boolean;
}

export function FileDropzone({
  onFileSelect,
  selectedFile,
  fileSha256,
  onClearFile,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, isSample = false) => {
    setErrorMessage(null);
    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsComputingHash(true);
      const hash = await computeFileSha256(file);
      setIsComputingHash(false);
      onFileSelect(file, hash, isSample);
    } catch {
      setIsComputingHash(false);
      setErrorMessage('Could not calculate file SHA-256 integrity hash');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Helper for one-click demo contract loading
  const loadSampleContract = async (sampleName: string, sizeBytes: number) => {
    const dummyBlob = new Blob(
      [
        `SAMPLE PDF CONTRACT FOR DEMO PURPOSES: ${sampleName}\n` +
          'Apex Enterprises Master Services Agreement\n' +
          'Generated for ClauseLens Hackathon Demonstration',
      ],
      { type: 'application/pdf' }
    );
    const sampleFile = new File([dummyBlob], sampleName, {
      type: 'application/pdf',
      lastModified: Date.now(),
    });
    // Override file size for realistic UI display
    Object.defineProperty(sampleFile, 'size', { value: sizeBytes });
    await processFile(sampleFile, true);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Box */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
            isDragOver
              ? 'border-blue-500 bg-blue-50/50 scale-[1.005]'
              : 'border-slate-300 bg-white hover:border-slate-400'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-3 shadow-xs">
            <UploadCloud className="w-7 h-7" />
          </div>

          {isComputingHash ? (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculating SHA-256 fingerprint from file bytes...</span>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-slate-800">
                Drag and drop your contract PDF here
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                or <span className="font-semibold text-blue-600 underline">browse files</span> from your computer
              </p>
            </>
          )}


          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span>Supported: PDF files only</span>
            <span>•</span>
            <span>Maximum size: 10 MB</span>
            <span>•</span>
            <span>Client-side SHA-256 verification</span>
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium bg-red-50 py-1.5 px-3 rounded-lg border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : (
        /* Selected file card */
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-slate-900 truncate max-w-md">
                    {selectedFile.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Valid PDF
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span>PDF Document</span>
                  {fileSha256 && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm">
                        <Hash className="w-3 h-3 text-slate-400" />
                        SHA-256: {truncateHash(fileSha256)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearFile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Demo Contract Presets for Judges */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Quick Demo Presets (No local PDF required)
          </h4>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          Click any sample agreement below to test the extraction and risk analysis workflow immediately:
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              loadSampleContract(
                'Apex_Enterprises_Master_Services_Agreement_2026.pdf',
                1428500
              )
            }
            className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300"
          >
            Load Sample: Apex SaaS MSA (High Risk)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              loadSampleContract(
                'NorthStar_Digital_Consulting_Retainer.pdf',
                784200
              )
            }
            className="text-xs bg-white hover:bg-blue-50 hover:border-blue-300"
          >
            Load Sample: Consulting Retainer (Medium Risk)
          </Button>
        </div>
      </div>
    </div>
  );
}
