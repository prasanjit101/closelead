"use client";

import { useEffect, useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { trpc } from "@/trpc/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronRightIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Column, ColumnDef } from "@tanstack/react-table";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export default function Leads() {
  const { data, isLoading, error, refetch } = trpc.lead.getLeads.useQuery();
  const { setLeads, setLoading, setError } = useLeads();
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };


  const columns: ColumnDef<(typeof leads)[number]>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <p>{row.original.name}</p>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) =>
        <p>{row.original.email}</p>
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Score" />
      ),
      cell: ({ row }) =>
        <p>{row.original.score}</p>
    },
    {
      id: 'scoreBreakdown',
      accessorFn: (row) => row.scoreBreakdown,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Score Breakdown" />
      ),
      cell: ({ row }) => row.original.scoreBreakdown,
    },
    {
      accessorKey: 'Webhook Source',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Webhook Source" />
      ),
      cell: ({ row }) =>
        <p>{row.original.webhookName}</p>
    },
    {
      accessorKey: 'Created At',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) =>
        row.original.createdAt ? new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
        }).format(row.original.createdAt) : 'N/A',
    },
    {
      accessorKey: 'Updated At',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) =>
        row.original.updatedAt ? new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
        }).format(row.original.updatedAt) : 'N/A',
    },
  ];

  const { table } = useDataTable({
    data: leads,
    columns,
    pageCount: 10,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load leads: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex w-full justify-between items-center mb-4">
        <h1 className="text-lg font-semibold ">Leads</h1>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <DataTableSortList table={table} />
        </DataTableToolbar>
      </DataTable>
    </div>
  );
}
