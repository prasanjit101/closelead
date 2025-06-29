import { create } from 'zustand';
import { Lead } from '@/server/db/schema';

type State = {
  leads: Lead[];
  selectedLeads: Lead[];
  isLoading: boolean;
  error: string | null;
};

type Actions = {
  setLeads: (leads: Lead[]) => void;
  toggleLeadSelection: (lead: Lead) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
};

export const useLeadsStore = create<State & Actions>((set) => ({
  leads: [],
  selectedLeads: [],
  isLoading: false,
  error: null,
  setLeads: (leads) => set({ leads }),
  toggleLeadSelection: (lead) =>
    set((state) => {
      const isSelected = state.selectedLeads.some((l) => l.id === lead.id);
      if (isSelected) {
        return {
          selectedLeads: state.selectedLeads.filter((l) => l.id !== lead.id),
        };
      } else {
        return { selectedLeads: [...state.selectedLeads, lead] };
      }
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
