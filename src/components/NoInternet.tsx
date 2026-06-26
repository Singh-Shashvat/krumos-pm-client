import React from 'react';
import { WifiOff } from 'lucide-react';

interface NoInternetProps {
  handleOnClick?: () => void;
}

const NoInternet: React.FC<NoInternetProps> = ({ handleOnClick }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bone text-ink select-none font-sans p-6 text-center">
      <WifiOff className="w-12 h-12 text-ink/40 mb-4 animate-pulse" />
      <h1 className="text-lg font-bold font-mono tracking-wider uppercase text-ink mb-2">
        CONNECTION LOST
      </h1>
      <p className="text-xs font-mono text-ink/60 mb-6 max-w-xs leading-relaxed">
        Your internet connection is offline. Please check your network and try
        again.
      </p>
      <button
        onClick={handleOnClick}
        className="bg-ink hover:bg-ink-soft text-bone px-6 py-2.5 border border-transparent shadow hover:shadow-md transition-all active:scale-95 font-mono text-[10px] font-bold tracking-wider uppercase"
      >
        RETRY CONNECTION
      </button>
    </div>
  );
};

export default NoInternet;
