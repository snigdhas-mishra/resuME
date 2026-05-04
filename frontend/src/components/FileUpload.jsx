import { useState, useRef } from 'react';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_SIZE_MB = 5;

export default function FileUpload({ file, onFileChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  function validate(f) {
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf('.'));
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError('Please upload a .pdf or .docx file');
      return false;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB} MB`);
      return false;
    }
    setError('');
    return true;
  }

  function handleFile(f) {
    if (validate(f)) onFileChange(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
        Resume File <span className="text-[var(--color-accent)]">*</span>
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          flex flex-col items-center justify-center gap-3
          transition-all duration-300 ease-out
          ${isDragging
            ? 'border-[var(--color-accent)] bg-[var(--color-accent-glow)] scale-[1.01]'
            : file
              ? 'border-[var(--color-success)]/40 bg-[var(--color-success)]/5'
              : 'border-[var(--color-border)] bg-[var(--color-bg-input)] hover:border-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.04)]'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />

        {/* Icon */}
        <div className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-300
          ${file
            ? 'bg-[var(--color-success)]/15 text-[var(--color-success)]'
            : 'bg-[var(--color-accent-glow)] text-[var(--color-accent-light)]'
          }
        `}>
          {file ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          )}
        </div>

        {file ? (
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{file.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{formatSize(file.size)} · Click to change</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-accent-light)]">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">PDF or DOCX · Max {MAX_SIZE_MB} MB</p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-[var(--color-error)] flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
