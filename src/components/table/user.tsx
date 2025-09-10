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
import { ChevronDown, Search } from "lucide-react";
import { Doc, Id } from "~/convex/_generated/dataModel";

// Use proper Convex types
type User = Doc<"users"> & {
  profile?: Doc<"userProfiles"> | null;
};

type BlacklistEntry = Doc<"blacklist"> & {
  user?: User | null;
  profile?: Doc<"userProfiles"> | null;
};

export type UserTableProps = {
  data: User[] | BlacklistEntry[];
  type: "users" | "blacklist";
  onAddToBlacklist?: (userId: string, reason: string) => void;
  onRemoveFromBlacklist?: (entryId: string) => void;
};

const UserTable: React.FC<UserTableProps> = ({ 
  data, 
  type, 
  onAddToBlacklist, 
  onRemoveFromBlacklist 
}) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const isBlacklist = type === "blacklist";

  const columns: ColumnDef<User | BlacklistEntry>[] = React.useMemo(() => {
    if (isBlacklist) {
      return [
        {
          accessorKey: "email",
          header: "Email",
          cell: ({ row }) => {
            const entry = row.original as BlacklistEntry;
            return entry.email || entry.user?.email || "N/A";
          },
        },
        {
          accessorKey: "username",
          header: "Username",
          cell: ({ row }) => {
            const entry = row.original as BlacklistEntry;
            return entry.profile?.username || entry.user?.profile?.username || "N/A";
          },
        },
        {
          accessorKey: "reason",
          header: "Reason",
          cell: ({ row }) => {
            const entry = row.original as BlacklistEntry;
            return entry.reason || "No reason provided";
          },
        },
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => {
            const entry = row.original as BlacklistEntry;
            return (
              <div className="flex space-x-2">
                {onRemoveFromBlacklist && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveFromBlacklist(entry._id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            );
          },
        },
      ];
    } else {
      return [
        {
          accessorKey: "email",
          header: "Email",
          cell: ({ row }) => {
            const user = row.original as User;
            return user.email || "N/A";
          },
        },
        {
          accessorKey: "username",
          header: "Username",
          cell: ({ row }) => {
            const user = row.original as User;
            return user.profile?.username || "N/A";
          },
        },
        {
          accessorKey: "displayName",
          header: "Display Name",
          cell: ({ row }) => {
            const user = row.original as User;
            return user.profile?.displayName || "N/A";
          },
        },
        {
          accessorKey: "isAdmin",
          header: "Role",
          cell: ({ row }) => {
            const user = row.original as User;
            return (
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.profile?.isAdmin 
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-gray-100 text-gray-800"
              }`}>
                {user.profile?.isAdmin ? "Admin" : "User"}
              </span>
            );
          },
        },
        {
          accessorKey: "isVerified",
          header: "Verified",
          cell: ({ row }) => {
            const user = row.original as User;
            return (
              <span className={`px-2 py-1 rounded-full text-xs ${
                user.profile?.isVerified 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"
              }`}>
                {user.profile?.isVerified ? "Verified" : "Unverified"}
              </span>
            );
          },
        },
        {
          accessorKey: "totalBids",
          header: "Total Bids",
          cell: ({ row }) => {
            const user = row.original as User;
            return user.profile?.totalBids || 0;
          },
        },
        {
          accessorKey: "rating",
          header: "Rating",
          cell: ({ row }) => {
            const user = row.original as User;
            return user.profile?.rating?.toFixed(1) || "N/A";
          },
        },
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => {
            const user = row.original as User;
            return (
              <div className="flex space-x-2">
                {onAddToBlacklist && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const reason = prompt("Enter reason for blacklisting:");
                      if (reason && user._id) {
                        onAddToBlacklist(user._id, reason);
                      }
                    }}
                  >
                    Blacklist
                  </Button>
                )}
              </div>
            );
          },
        },
      ];
    }
  }, [isBlacklist, onAddToBlacklist, onRemoveFromBlacklist]);

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
            placeholder={`Filter ${isBlacklist ? "blacklist entries" : "users"}...`}
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
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

export default UserTable;