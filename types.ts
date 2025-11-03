export interface Raffle {
  id: number;
  title: string;
  description: string;
  endDate: Date;
  drawDate: Date;
  numberPrice: number;
  totalNumbers: number;
  soldNumbers: number[];
}

// FIX: Replaced inline object type with a named interface `AIStudio` to resolve
// conflicting global declarations for `window.aistudio`.
// This is a placeholder for the global object that will be provided by the environment.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio: AIStudio;
  }
}
