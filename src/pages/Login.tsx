import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const hasInviteToken = sessionStorage.getItem('krumos_invite_token') !== null;

  useEffect(() => {
    // Force light theme on login page
    const prevDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.remove('dark');
    return () => {
      // Restore on unmount if it was previously dark
      if (prevDark) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bone text-ink select-none relative overflow-hidden">
      {/* Decorative architectural grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 bottom-0 left-[10%] w-[1px] bg-ink"></div>
        <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-ink"></div>
        <div className="absolute top-0 bottom-0 left-[90%] w-[1px] bg-ink"></div>
        <div className="absolute left-0 right-0 top-[25%] h-[1px] bg-ink"></div>
        <div className="absolute left-0 right-0 top-[75%] h-[1px] bg-ink"></div>
      </div>

      {/* Header border */}
      <header className="krumos-border-b flex justify-between items-center py-6 px-8 relative z-10">
        <div className="flex items-center space-x-2">
          <span className="font-mono text-xs font-bold px-2 py-1 bg-ink text-bone tracking-widest uppercase">
            KR-01
          </span>
          <span className="krumos-heading text-lg font-black tracking-tighter">
            KRUMOS
          </span>
        </div>
        <div className="krumos-eyebrow text-xs opacity-60">
          INTERNAL SUITE v1.0.0
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="max-w-md w-full text-center space-y-12">
          <div className="space-y-4">
            <p className="krumos-eyebrow text-xs text-orange-accent tracking-widest">
              WORKSPACE MANAGEMENT PLATFORM
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight uppercase leading-none">
              MANAGE PROJECTS WITH UTMOST INTEGRITY.
            </h1>
            <p className="text-sm text-ink-text max-w-sm mx-auto font-sans leading-relaxed">
              Complete task isolation, real-time collaboration, and performance
              metrics built for high-velocity teams.
            </p>
          </div>

          {/* Interactive Card */}
          <div className="bg-ink text-bone p-8 border border-white/10 shadow-2xl space-y-6 rounded-none relative">
            {/* Absolute corner details */}
            <div className="absolute -top-[1px] -left-[1px] w-2 h-2 bg-orange-accent"></div>
            <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 bg-orange-accent"></div>

            {hasInviteToken && (
              <div className="p-3 bg-orange-accent/15 border border-orange-accent/40 text-orange-hot font-mono text-[9px] uppercase tracking-wide text-left">
                PENDING INVITATION DETECTED. PLEASE SIGN IN WITH GOOGLE TO
                AUTHORIZE ACCESS AND JOIN THE WORKSPACE.
              </div>
            )}

            <div className="space-y-2">
              <span className="krumos-eyebrow text-[10px] text-white/50 block">
                SECURE IDENTIFICATION GATEWAY
              </span>
              <h2 className="text-xl font-bold font-mono tracking-wider uppercase">
                AUTHENTICATION
              </h2>
            </div>

            <div className="krumos-border-t border-white/10 pt-6">
              <button
                onClick={loginWithGoogle}
                className="w-full flex items-center justify-center space-x-3 bg-bone text-ink hover:bg-bone-dark py-4 px-6 krumos-mono-btn active:scale-[0.98] border border-transparent shadow-md hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.2662 9.7651A7.077 7.077 0 0 1 12 4.9091c1.6909 0 3.218.6 4.4182 1.5818L19.773 3.1455C17.6727 1.2 15.008 0 12 0 7.3545 0 3.393 2.651 1.488 6.5455l3.7782 3.2196z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.2727c0-.8182-.0736-1.609-.2086-2.3727H12v4.5454h6.4718c-.2782 1.4795-1.1209 2.73-2.3945 3.5864l3.7173 2.8854c2.1764-2.0064 3.7055-4.9568 3.7055-8.6445z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.2662 14.2349a7.11 7.11 0 0 1-.3753-2.2349c0-.7773.1363-1.5218.3753-2.2349L1.488 6.5455A11.966 11.966 0 0 0 0 12c0 2.01.4964 3.911 1.3782 5.5909l3.888-3.356z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.9564-1.0773 7.9418-2.9182l-3.7173-2.8854c-1.0282.6873-2.341 1.109-4.2245 1.109-3.262 0-6.0273-2.2036-7.0173-5.1764L1.0936 17.514A11.965 11.965 0 0 0 12 24z"
                  />
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </button>
            </div>

            <p className="text-[10px] text-white/40 font-mono tracking-wide leading-relaxed">
              By authenticating, you agree to comply with organizational data
              governance rules. Workspaces are strictly monitored for activity
              and security isolation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer border */}
      <footer className="krumos-border-t py-4 px-8 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono opacity-50 relative z-10">
        <div>© 2026 KRUMOS TECH LLP. ALL RIGHTS RESERVED.</div>
        <div className="flex space-x-4 mt-2 sm:mt-0">
          <a href="#" className="hover:underline">
            PRIVACY POLICY
          </a>
          <span>/</span>
          <a href="#" className="hover:underline">
            TERMS OF SERVICE
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Login;
