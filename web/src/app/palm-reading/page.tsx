'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { palmReadingAPI } from '@/lib/api';

type PhotoSlot = { label: string; desc: string; icon: string; file: File | null; preview: string };

export default function PalmReadingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const faceInputRef = useRef<HTMLInputElement>(null);
  const palmInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { label: 'Face Photo', desc: 'Clear, front-facing photo of your face', icon: '🧑', file: null, preview: '' },
    { label: 'Palm Photo', desc: 'Open palm facing the camera, fingers spread', icon: '🤚', file: null, preview: '' },
  ]);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback((index: number, file: File | null) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }
    setError('');
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file, preview: URL.createObjectURL(file) };
      return updated;
    });
  }, []);

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], file: null, preview: '' };
      return updated;
    });
  };

  const allPhotosReady = photos.every(p => p.file !== null);

  const handleAnalyze = async () => {
    if (!user) {
      router.push('/login?redirect=/palm-reading');
      return;
    }
    if (!allPhotosReady) return;
    setError('');
    setAnalyzing(true);
    try {
      const formData = new FormData();
      photos.forEach(p => formData.append('images', p.file!));
      formData.append('language', 'en');
      const data = await palmReadingAPI.create(formData);
      router.push(`/palm-reading/report/${data.id}`);
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login?redirect=/palm-reading');
        return;
      }
      setError(err.error || 'Analysis failed. Please try again.');
      setAnalyzing(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin text-3xl">🤚</div></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-4xl">🤚</span>
        <h1 className="text-3xl font-bold text-text mt-3">Palm & Face Reading</h1>
        <div className="flex justify-center items-center gap-2 mt-2 text-gold text-sm">
          <span className="w-6 h-px bg-gold" /><span>◆</span><span className="w-6 h-px bg-gold" />
        </div>
        <p className="text-text-secondary mt-3 max-w-md mx-auto">
          Upload a photo of your face and palm. Our AI fortune master will analyze your life lines, facial features, and reveal insights about your destiny.
        </p>
      </div>

      {error && (
        <div className="bg-fire/10 text-fire text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      {/* Photo slots */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {photos.map((slot, i) => (
          <div key={slot.label} className="flex flex-col">
            <p className="text-sm font-semibold text-text mb-2 flex items-center gap-2">
              <span>{slot.icon}</span> {slot.label}
            </p>
            {slot.preview ? (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border group">
                <img src={slot.preview} alt={slot.label} className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-2 right-2 w-8 h-8 bg-primary text-gold-light rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className="aspect-[3/4] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors"
                onClick={() => (i === 0 ? faceInputRef : palmInputRef).current?.click()}
              >
                <span className="text-5xl mb-3 opacity-40">{slot.icon}</span>
                <p className="text-sm text-text-muted text-center px-4">{slot.desc}</p>
                <p className="text-xs text-text-muted mt-2">Click to upload</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <input
        ref={faceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(0, e.target.files[0]); e.target.value = ''; }}
      />
      <input
        ref={palmInputRef}
        type="file"
        accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(1, e.target.files[0]); e.target.value = ''; }}
      />

      {/* Analyze button */}
      <button
        onClick={handleAnalyze}
        disabled={!allPhotosReady || analyzing}
        className="w-full bg-primary text-gold-light font-semibold py-4 rounded-xl text-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
      >
        {analyzing ? (
          <><span className="animate-spin">🤚</span> Reading Your Fortune...</>
        ) : allPhotosReady ? (
          <>Start Reading</>
        ) : (
          <>Upload Both Photos to Continue</>
        )}
      </button>

      {/* Tips */}
      <div className="mt-10 bg-bg-card rounded-2xl p-6 border border-border">
        <h3 className="text-sm font-semibold text-gold tracking-wider uppercase mb-3">Tips for Best Results</h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li>• Take your face photo in good, even lighting — no sunglasses or hats</li>
          <li>• For the palm photo, spread your fingers naturally and keep your hand flat</li>
          <li>• Use your dominant hand (right if right-handed) for the most accurate reading</li>
          <li>• Make sure palm lines are clearly visible — good lighting is key</li>
        </ul>
      </div>

      {!user && (
        <div className="mt-6 text-center text-sm text-text-muted">
          You&apos;ll need to{' '}
          <a href="/login" className="text-primary font-medium hover:underline">sign in</a>{' '}
          before starting the reading.
        </div>
      )}
    </div>
  );
}
