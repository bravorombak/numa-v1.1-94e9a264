import { create } from 'zustand';

// Example Zustand store for local UI state
// Expand this as needed for your application's UI state management
interface UIState {
  // Add your UI state properties here
  exampleState: boolean;
  setExampleState: (value: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  exampleState: false,
  setExampleState: (value) => set({ exampleState: value }),
}));
