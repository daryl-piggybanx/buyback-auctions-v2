import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChevronDown, Search, Eye } from "lucide-react";
import { Doc, Id } from "~/convex/_generated/dataModel";
import { Link } from '@tanstack/react-router';

// Profile with user data
type ProfileWithUser = Doc<"userProfiles"> & {
  user?: Doc<"users"> | null;
  email?: string | null;
};

export type ProfilesTableProps = {
  data: ProfileWithUser[];
};

const ProfilesTable: React.FC<ProfilesTableProps> = ({ data }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<ProfileWithUser>[] = React.useMemo(() => [
    {
      accessorKey: "username",
      header: "Username",
      cell: ({ row }) => {
        const profile = row.original;
        return profile.username || "N/A";
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const profile = row.original;
        return profile.email || "N/A";
      },
    },
    {
      accessorKey: "isAdmin",
      header: "Role",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            profile.isAdmin 
              ? "bg-blue-100 text-blue-800" 
              : "bg-gray-100 text-gray-800"
          }`}>
            {profile.isAdmin ? "Admin" : "User"}
          </span>
        );
      },
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            profile.isVerified 
              ? "bg-green-100 text-green-800" 
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {profile.isVerified ? "Verified" : "Unverified"}
          </span>
        );
      },
    },
    {
      accessorKey: "isBlacklisted",
      header: "Status",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            profile.isBlacklisted 
              ? "bg-red-100 text-red-800" 
              : "bg-green-100 text-green-800"
          }`}>
            {profile.isBlacklisted ? "Blacklisted" : "Active"}
          </span>
        );
      },
    },
    {
      accessorKey: "totalBids",
      header: "Total Bids",
      cell: ({ row }) => {
        const profile = row.original;
        return profile.totalBids || 0;
      },
    },
    {
      accessorKey: "totalAuctions",
      header: "Total Auctions",
      cell: ({ row }) => {
        const profile = row.original;
        return profile.totalAuctions || 0;
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const profile = row.original;
        return profile.rating?.toFixed(1) || "N/A";
      },
    },
    {
      accessorKey: "joinedAt",
      header: "Joined",
      cell: ({ row }) => {
        const profile = row.original;
        return profile.joinedAt 
          ? new Date(profile.joinedAt).toLocaleDateString() 
          : "N/A";
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex space-x-2">
            <Link to="/admin/profiles/$profileId" params={{ profileId: profile._id }}>
              <Button variant="outline" size="sm">
                <Eye className="mr-1 w-4 h-4" />
                View
              </Button>
            </Link>
          </div>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter profiles..."
            value={(table.getColumn("username")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("username")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-end items-center py-4 space-x-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilesTable;
