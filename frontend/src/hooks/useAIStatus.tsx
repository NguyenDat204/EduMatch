/**
 * useAIStatus — global AI processing state shared across tabs via localStorage events.
 *
 * - Khi AI đang chạy: set `edumatch_ai_running = "1"` → tất cả tabs nhận sự kiện
 * - Khi xong: xóa key → spinner biến mất trên mọi tab đang mở
 * - Không làm gián đoạn navigation — chỉ là indicator
 */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const AI_STORAGE_KEY = 'edumatch_ai_running';

interface AIStatusContextType {
  isAIRunning: boolean;
  setAIRunning: (running: boolean) => void;
}

const AIStatusContext = createContext<AIStatusContextType>({
  isAIRunning: false,
  setAIRunning: () => {},
});

export const AIStatusProvider = ({ children }: { children: ReactNode }) => {
  const [isAIRunning, setIsAIRunning] = useState(() => {
    try { return localStorage.getItem(AI_STORAGE_KEY) === '1'; } catch { return false; }
  });

  // Listen for changes from other tabs
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === AI_STORAGE_KEY) {
        setIsAIRunning(e.newValue === '1');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setAIRunning = (running: boolean) => {
    try {
      if (running) {
        localStorage.setItem(AI_STORAGE_KEY, '1');
      } else {
        localStorage.removeItem(AI_STORAGE_KEY);
      }
    } catch { /* ignore */ }
    setIsAIRunning(running);
  };

  return (
    <AIStatusContext.Provider value={{ isAIRunning, setAIRunning }}>
      {children}
    </AIStatusContext.Provider>
  );
};

export const useAIStatus = () => useContext(AIStatusContext);
