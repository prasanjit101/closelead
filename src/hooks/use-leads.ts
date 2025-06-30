import { useLeadsStore } from "@/store/leads";

export const useLeads = () => {
  const leads = useLeadsStore((state) => state.leads);
  const selectedLeads = useLeadsStore((state) => state.selectedLeads);
  const isLoading = useLeadsStore((state) => state.isLoading);
  const error = useLeadsStore((state) => state.error);
  const setLeads = useLeadsStore((state) => state.setLeads);
  const toggleLeadSelection = useLeadsStore(
    (state) => state.toggleLeadSelection,
  );
  const setLoading = useLeadsStore((state) => state.setLoading);
  const setError = useLeadsStore((state) => state.setError);

  return {
    leads,
    selectedLeads,
    isLoading,
    error,
    setLeads,
    toggleLeadSelection,
    setLoading,
    setError,
  };
};
