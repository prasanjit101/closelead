import { Lead } from '@/server/db/schema';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'));
      const formattedDate = date.toLocaleDateString();
      return <div>{formattedDate}</div>;
    },
  },
];
