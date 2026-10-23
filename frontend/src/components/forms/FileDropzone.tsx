import { useRef, useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
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
    <div className="w-full space-y-3.5">
      {/* Upload Box */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-lg border-2 border-dashed p-7 text-center transition-colors ${
            isDragOver
              ? 'border-slate-400 bg-slate-50'
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

          <div className="mx-auto flex h-10 w-10 items-center justify-center text-slate-400 mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>

          {isComputingHash ? (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
              <span>Calculating SHA-256 integrity hash...</span>
            </div>
          ) : (
            <>
              <h3 className="text-xs font-medium text-slate-900">
                Drag and drop your contract PDF here
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                or <span className="text-slate-800 underline">browse files</span>
              </p>
            </>
          )}

          <div className="mt-3 flex items-center justify-center gap-3 text-[11px] text-slate-400">
            <span>PDF files up to 10 MB</span>
            <span>·</span>
            <span>Client-side SHA-256 calculation</span>
          </div>

          {errorMessage && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-red-700 bg-red-50 py-1.5 px-3 rounded border border-red-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      ) : (
        /* Selected file card */
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-medium text-slate-900 truncate max-w-md">
                    {selectedFile.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Valid PDF
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>·</span>
                  <span>PDF document</span>
                  {fileSha256 && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-[11px] text-slate-500">
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
              className="rounded p-1 text-slate-400 hover:text-slate-700 transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Demo Contract Presets */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs">
        <h4 className="font-medium text-slate-800">
          Demo sample contracts
        </h4>
        <p className="text-slate-500 mt-0.5 mb-2.5">
          Select a sample agreement to test the workflow without uploading a personal file:
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
            className="text-xs"
          >
            Sample: Apex SaaS MSA (High risk)
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
            className="text-xs"
          >
            Sample: Consulting Retainer (Medium risk)
          </Button>
        </div>
      </div>
    </div>

  );
}
