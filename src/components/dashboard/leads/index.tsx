"use client";

import { useEffect } from 'react';
import { useLeads } from '@/hooks/use-leads';
import { trpc } from '@/trpc/react';
import { DataTable } from './data-table';
import { columns } from './columns';

export default function Leads() {
  const { data, isLoading, error } = trpc.lead.getLeads.useQuery();
  const { setLeads, setLoading, setError } = useLeads();

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      setError(error.message);
    }
  }, [error, setError]);

  useEffect(() => {
    if (data) {
      setLeads(data);
    }
  }, [data, setLeads]);

  const { leads } = useLeads();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={leads} />
    </div>
  );
}
