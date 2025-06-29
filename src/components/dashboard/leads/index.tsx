"use client";

import { useEffect, useState } from 'react';
import { useLeads } from '@/hooks/use-leads';
import { trpc } from '@/trpc/react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { ScoreBreakdownModal } from './ScoreBreakdownModal';

export default function Leads() {
  const { data, isLoading, error } = trpc.lead.getLeads.useQuery();
  const { setLeads, setLoading, setError } = useLeads();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);

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

  // Enhanced columns with score breakdown modal
  const enhancedColumns = columns.map(column => {
    if (column.accessorKey === 'score') {
      return {
        ...column,
        cell: ({ row }: any) => {
          const score = row.getValue('score') as number | null;
          const lead = row.original;
          
          return (
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                !score ? 'bg-gray-100 text-gray-800' :
                score >= 8 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                score >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                score >= 4 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {score ? `${score}/10` : 'N/A'}
              </span>
              {lead.scoreBreakdown && (
                <button
                  onClick={() => {
                    setSelectedLead(lead);
                    setShowScoreModal(true);
                  }}
                  className="inline-flex items-center justify-center w-6 h-6 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  👁️
                </button>
              )}
            </div>
          );
        },
      };
    }
    return column;
  });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage and track your leads with AI-powered scoring
        </p>
      </div>
      
      <DataTable columns={enhancedColumns} data={leads} />
      
      <ScoreBreakdownModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
        leadName={selectedLead?.name || ''}
        scoreBreakdown={selectedLead?.scoreBreakdown ? JSON.parse(selectedLead.scoreBreakdown) : null}
      />
    </div>
  );
}