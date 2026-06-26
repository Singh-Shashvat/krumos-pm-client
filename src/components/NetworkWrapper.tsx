import { type ReactNode, useEffect, useState } from 'react';

export const NO_INTERNET_ERROR = 'No Internet Connection';

const NetworkWrapper = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    throw new Error(NO_INTERNET_ERROR);
  }

  return <>{children}</>;
};

export default NetworkWrapper;
