export default function ResultsView({ files, onReset }) {
  function handleDownload(file) {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="animate-fade-in-up">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-[var(--color-success)]/15 flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Your resume{files.length > 1 ? 's are' : ' is'} ready!
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mt-2">
          {files.length} tailored variation{files.length > 1 ? 's' : ''} generated successfully
        </p>
      </div>

      {/* Download cards */}
      <div className="grid gap-4">
        {files.map((file, idx) => (
          <div
            key={idx}
            className={`glass-card p-5 flex items-center justify-between gap-4 animate-fade-in-up`}
            style={{ animationDelay: `${idx * 0.1}s`, opacity: 0, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-4">
              {/* File icon */}
              <div className="w-11 h-11 rounded-lg bg-[var(--color-accent-glow)] flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[var(--color-accent-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{file.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {files.length > 1 ? `Variation ${idx + 1}` : 'Tailored Resume'} · DOCX
                </p>
              </div>
            </div>

            <button
              onClick={() => handleDownload(file)}
              className="
                px-4 py-2 rounded-lg text-sm font-medium
                bg-[var(--color-accent)] text-white
                hover:bg-[var(--color-accent-dark)]
                active:scale-95
                transition-all duration-200
                cursor-pointer
                flex items-center gap-2 shrink-0
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download
            </button>
          </div>
        ))}
      </div>

      {/* Reset button */}
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="
            px-6 py-2.5 rounded-lg text-sm font-medium
            border border-[var(--color-border)] text-[var(--color-text-secondary)]
            hover:border-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]
            hover:bg-[rgba(255,255,255,0.03)]
            active:scale-95
            transition-all duration-200
            cursor-pointer
          "
        >
          ← Tailor Another Resume
        </button>
      </div>
    </div>
  );
}
