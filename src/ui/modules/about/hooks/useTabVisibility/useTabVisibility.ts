import { useSyncExternalStore } from 'react';

export const TabVisibility = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
  UNDEFINED: 'undefined',
} as const;


export function useTabVisibility(): (typeof TabVisibility)[keyof typeof TabVisibility] {
  const subscribe = (callback: () => void) => {
    document.addEventListener('visibilitychange', callback);
    return () => {
      document.removeEventListener('visibilitychange', callback);
    };
  };

  const getSnapshot = (): DocumentVisibilityState => document.visibilityState;

  return useSyncExternalStore(subscribe, getSnapshot);
}
