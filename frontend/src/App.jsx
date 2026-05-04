import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ResumeForm from './components/ResumeForm';
import LoadingOverlay from './components/LoadingOverlay';
import ResultsView from './components/ResultsView';

const API_URL = 'http://localhost:8000';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null); // { files: [{ name, url }] }

  async function handleSubmit({ file, jobDescription, instructions, variations }) {
    setIsLoading(true);
    setResults(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('job_description', jobDescription);
    formData.append('instructions', instructions);
    formData.append('variations', variations.toString());
    formData.append('output_format', 'docx');

    try {
      const response = await fetch(`${API_URL}/api/generate-resume`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || `Server error (${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      const blob = await response.blob();

      let files = [];

      if (contentType.includes('zip')) {
        const url = URL.createObjectURL(blob);
        files = [{ name: 'tailored_resumes.zip', url }];
      } else {
        const url = URL.createObjectURL(blob);
        files = [{ name: 'tailored_resume.docx', url }];
      }

      setResults({ files });
      toast.success('Resume tailored successfully!');
    } catch (err) {
      const message = err.message || 'Something went wrong';

      // Provide user-friendly messages for common issues
      if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
        toast.error('Cannot reach the server. Is the backend running on port 8000?');
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    if (results) {
      results.files.forEach((f) => URL.revokeObjectURL(f.url));
    }
    setResults(null);
  }

  return (
    <>
      {/* Toast container */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1a1a2e',
            color: '#f0f0f5',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1a1a2e',
            },
          },
          error: {
            duration: 7000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1a1a2e',
            },
          },
        }}
      />

      {isLoading && <LoadingOverlay />}

      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-2 px-6 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-extrabold tracking-tight">
              resu
              <span className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)] bg-clip-text text-transparent">
                ME
              </span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-sm mt-2 max-w-md mx-auto">
              Upload your resume, paste a job description, and let AI tailor it — 
              without inventing anything new.
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-lg">
            <div className="glass-card p-6 sm:p-8">
              {results ? (
                <ResultsView files={results.files} onReset={handleReset} />
              ) : (
                <ResumeForm onSubmit={handleSubmit} isLoading={isLoading} />
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center">
          <p className="text-xs text-[var(--color-text-muted)]">
            Built with FastAPI + React · Your data is never stored
          </p>
        </footer>
      </div>
    </>
  );
}
