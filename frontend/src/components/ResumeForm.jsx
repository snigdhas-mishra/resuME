import { useState } from 'react';
import toast from 'react-hot-toast';
import FileUpload from './FileUpload';

export default function ResumeForm({ onSubmit, isLoading }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [variations, setVariations] = useState(1);
  const [showInstructions, setShowInstructions] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload your resume first');
      return;
    }
    if (!jobDescription.trim()) {
      toast.error('Please paste the job description');
      return;
    }
    onSubmit({ file, jobDescription, instructions, variations });
  }

  const isValid = file && jobDescription.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resume Upload */}
      <div className="animate-fade-in-up-delay-1">
        <FileUpload file={file} onFileChange={setFile} />
      </div>

      {/* Job Description */}
      <div className="animate-fade-in-up-delay-2">
        <label
          htmlFor="job-description"
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          Job Description <span className="text-[var(--color-accent)]">*</span>
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={8}
          className="
            w-full rounded-xl px-4 py-3 text-sm
            bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
            border border-[var(--color-border)]
            placeholder-[var(--color-text-muted)]
            focus:outline-none focus:border-[var(--color-border-focus)]
            focus:ring-1 focus:ring-[var(--color-border-focus)]
            transition-all duration-200
            resize-y min-h-[120px]
          "
        />
        <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
          {jobDescription.length > 0 && `${jobDescription.split(/\s+/).filter(Boolean).length} words`}
        </p>
      </div>

      {/* Settings row */}
      <div className="animate-fade-in-up-delay-3 space-y-4">
        {/* Variations */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
            Number of Variations
          </label>
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setVariations(n)}
                className={`
                  flex-1 py-2.5 rounded-lg text-sm font-medium
                  border transition-all duration-200 cursor-pointer
                  ${variations === n
                    ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/20'
                    : 'bg-[var(--color-bg-input)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'
                  }
                `}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            More variations = more time, but more options to choose from
          </p>
        </div>

        {/* Custom Instructions Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="
              flex items-center gap-2 text-sm text-[var(--color-text-secondary)]
              hover:text-[var(--color-accent-light)] transition-colors duration-200
              cursor-pointer
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-4 h-4 transition-transform duration-200 ${showInstructions ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            Custom Instructions (optional)
          </button>

          {showInstructions && (
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Emphasize leadership experience, keep it to one page…"
              rows={3}
              className="
                w-full mt-3 rounded-xl px-4 py-3 text-sm
                bg-[var(--color-bg-input)] text-[var(--color-text-primary)]
                border border-[var(--color-border)]
                placeholder-[var(--color-text-muted)]
                focus:outline-none focus:border-[var(--color-border-focus)]
                focus:ring-1 focus:ring-[var(--color-border-focus)]
                transition-all duration-200
                resize-y
                animate-fade-in-up
              "
            />
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className={`
            w-full py-3.5 rounded-xl text-sm font-semibold
            transition-all duration-300 cursor-pointer
            flex items-center justify-center gap-2
            ${isValid
              ? 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark)] text-white shadow-lg shadow-[var(--color-accent)]/25 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-[var(--color-bg-input)] text-[var(--color-text-muted)] border border-[var(--color-border)] cursor-not-allowed'
            }
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
          Tailor My Resume
        </button>
      </div>
    </form>
  );
}
