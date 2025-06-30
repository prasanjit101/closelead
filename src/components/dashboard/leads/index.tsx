"use client";

import { useEffect, useState } from "react";
import { useLeads } from "@/hooks/use-leads";
import { trpc } from "@/trpc/react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from '@/components/ui/kibo-ui/table';
import type { ColumnDef } from '@/components/ui/kibo-ui/table';
import { ChevronRightIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";


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
        <TableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <p>{row.original.name}</p>
      ),
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) =>
        <p>{row.original.email}</p>
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Score" />
      ),
      cell: ({ row }) =>
        <p>{row.original.score}</p>
    },
    {
      id: 'scoreBreakdown',
      accessorFn: (row) => row.scoreBreakdown,
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Score Breakdown" />
      ),
      cell: ({ row }) => row.original.scoreBreakdown,
    },
    {
      accessorKey: 'Webhook Source',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Webhook Source" />
      ),
      cell: ({ row }) =>
        <p>{row.original.webhookName}</p>
    },
    {
      accessorKey: 'Created At',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) =>
        row.original.createdAt ? new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
        }).format(row.original.createdAt) : 'N/A',
    },
    {
      accessorKey: 'Updated At',
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Updated At" />
      ),
      cell: ({ row }) =>
        row.original.updatedAt ? new Intl.DateTimeFormat('en-US', {
          dateStyle: 'medium',
        }).format(row.original.updatedAt) : 'N/A',
    },
  ];

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
      <TableProvider columns={columns} data={leads}>
        <TableHeader>
          {({ headerGroup }) => (
            <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
              {({ header }) => <TableHead header={header} key={header.id} />}
            </TableHeaderGroup>
          )}
        </TableHeader>
        <TableBody>
          {({ row }) => (
            <TableRow key={row.id} row={row}>
              {({ cell }) => <TableCell cell={cell} key={cell.id} />}
            </TableRow>
          )}
        </TableBody>
      </TableProvider>
    </div>
  );
}
