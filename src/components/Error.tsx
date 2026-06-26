import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorProps {
  refresh?: boolean;
  backToHome?: () => void;
}

const Error: React.FC<ErrorProps> = ({ refresh, backToHome }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bone text-ink select-none font-sans p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-orange-accent mb-4 animate-bounce" />
      <h1 className="text-lg font-bold font-mono tracking-wider uppercase text-ink mb-2">
        SOMETHING WENT WRONG
      </h1>
      <p className="text-xs font-mono text-ink/60 mb-6 max-w-xs leading-relaxed">
        An unexpected application error occurred. Click below to reload or
        return home.
      </p>
      <div className="flex gap-4">
        {backToHome && (
          <button
            onClick={backToHome}
            className="bg-bone border border-ink/20 hover:bg-bone-dark px-6 py-2.5 shadow hover:shadow-md transition-all active:scale-95 font-mono text-[10px] font-bold tracking-wider uppercase text-ink"
          >
            RETURN HOME
          </button>
        )}
        {refresh && (
          <button
            onClick={() => window.location.reload()}
            className="bg-ink hover:bg-ink-soft text-bone px-6 py-2.5 border border-transparent shadow hover:shadow-md transition-all active:scale-95 font-mono text-[10px] font-bold tracking-wider uppercase"
          >
            REFRESH PAGE
          </button>
        )}
      </div>
    </div>
  );
};

export default Error;
