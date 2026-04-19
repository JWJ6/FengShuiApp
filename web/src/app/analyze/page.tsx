'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { reportAPI } from '@/lib/api';

export default function AnalyzePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(f =>
      ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'].includes(f.type)
    );
    setFiles(prev => {
      const combined = [...prev, ...validFiles].slice(0, 5);
      setPreviews(combined.map(f => URL.createObjectURL(f)));
      return combined;
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setPreviews(updated.map(f => URL.createObjectURL(f)));
      return updated;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const handleAnalyze = async () => {
    if (!user) {
      router.push('/login?redirect=/analyze');
      return;
    }
    if (files.length === 0) return;
    setError('');
    setAnalyzing(true);
    try {
      const formData = new FormData();
      files.forEach(f => formData.append('images', f));
      formData.append('language', 'en');
      const data = await reportAPI.create(formData);
      router.push(`/report/${data.id}`);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login?redirect=/analyze');
        return;
      }
      setError(err.error || 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin text-3xl">☯</div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-4xl">☯</span>
        <h1 className="text-3xl font-bold text-text mt-3">Feng Shui Analysis</h1>
        <div className="flex justify-center items-center gap-2 mt-2 text-gold text-sm">
          <span className="w-6 h-px bg-gold" /><span>◆</span><span className="w-6 h-px bg-gold" />
        </div>
        <p className="text-text-secondary mt-3 max-w-md mx-auto">
          Upload photos of your home interior, exterior, or floor plan. Our AI Feng Shui master will analyze the energy flow.
        </p>
      </div>

      {error && (
        <div className="bg-fire/10 text-fire text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-gold/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); }}
        />
        <div className="text-4xl mb-3">📸</div>
        <p className="text-text font-medium">Drop images here or click to browse</p>
        <p className="text-text-muted text-sm mt-1">JPEG, PNG, HEIC — up to 5 images, 10MB each</p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium text-text-secondary mb-3">
            Selected Photos ({files.length}/5)
          </p>
          <div className="grid grid-cols-5 gap-3">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-1 right-1 w-6 h-6 bg-primary text-gold-light rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyze button */}
      {files.length > 0 && (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full mt-8 bg-primary text-gold-light font-semibold py-4 rounded-xl text-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
        >
          {analyzing ? (
            <><span className="animate-spin">☯</span> Analyzing...</>
          ) : (
            <>Start Analysis ({files.length}/5)</>
          )}
        </button>
      )}

      {/* Tips */}
      <div className="mt-10 bg-bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-gold tracking-wider uppercase mb-3">Tips for Best Results</h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>• Take photos in good lighting for better analysis</li>
          <li>• Include the full room in the frame if possible</li>
          <li>• Upload floor plans for the most comprehensive reading</li>
        </ul>
      </div>

      {!user && (
        <div className="mt-6 text-center text-sm text-text-muted">
          You&apos;ll need to{' '}
          <a href="/login" className="text-primary font-medium hover:underline">sign in</a>{' '}
          before starting the analysis.
        </div>
      )}
    </div>
  );
}
