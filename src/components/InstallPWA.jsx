import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('transitionend', handler);
  }, []);

  const onClick = (evt) => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
    setIsVisible(false);
  };

  if (!supportsPWA || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white border border-zinc-200 shadow-xl rounded-2xl p-4 z-[999] animate-fade-in flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
        <Download className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-sm text-zinc-900">Instal Aplikasi</h4>
        <p className="text-xs text-zinc-500 mb-3 mt-0.5">Tambahkan ke Layar Utama HP Anda untuk akses lebih cepat.</p>
        <div className="flex gap-2">
          <button onClick={onClick} className="bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
            Instal Sekarang
          </button>
          <button onClick={() => setIsVisible(false)} className="text-zinc-500 text-xs font-bold px-3 py-1.5 hover:bg-zinc-100 rounded-lg">
            Nanti
          </button>
        </div>
      </div>
      <button onClick={() => setIsVisible(false)} className="text-zinc-400 hover:text-zinc-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}