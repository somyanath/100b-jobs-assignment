import type { I_CandidateWithScore } from "@/types/Candidate";
import { flexRender, getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Eye, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface I_CandidatesDataTableProps {
  candidates: I_CandidateWithScore[];
  onViewDetails: (candidate: I_CandidateWithScore) => void;
  onSelectForTeam: (candidate: I_CandidateWithScore) => void;
  showSelectButtons?: boolean;
}

/**
 * Candidates data table component
 * Displays candidates in a sortable, paginated table with actions
 */
const CandidatesDataTable = ({ 
  candidates, 
  onViewDetails, 
  onSelectForTeam, 
  showSelectButtons = true 
}: I_CandidatesDataTableProps) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Event handlers
  const handleViewDetails = useCallback((candidate: I_CandidateWithScore) => {
    onViewDetails(candidate);
  }, [onViewDetails]);

  const handleSelectForTeam = useCallback((candidate: I_CandidateWithScore, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onSelectForTeam(candidate);
  }, [onSelectForTeam]);

  // Table columns definition
  const columns: ColumnDef<I_CandidateWithScore>[] = useMemo(() => [
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const score = row.getValue('score') as number;
        return (
          <div className="ml-4">
            <span className={`inline-block px-2 py-1 rounded text-sm font-medium`}>
              {score?.toFixed(1) || 'N/A'}
            </span>
          </div>
        );
      },
      size: 80,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div className="min-w-0">
            <div 
              className="font-semibold text-gray-900 truncate cursor-pointer hover:text-blue-600" 
              onClick={() => handleViewDetails(candidate)}
            >
              {candidate.name}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {candidate.currentCompany || 'Not specified'} • {candidate.work_availability?.join(', ') || 'Not specified'}
            </div>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'currentRole',
      header: 'Current Role',
      cell: ({ row }) => {
        const role = row.getValue('currentRole') as string;
        return <div className="text-sm truncate">{role || 'Not specified'}</div>;
      },
      size: 150,
    },
    {
      accessorKey: 'highestEducation',
      header: 'Education',
      cell: ({ row }) => {
        const education = row.getValue('highestEducation') as string;
        return <div className="text-sm truncate">{education || 'Not specified'}</div>;
      },
      size: 120,
    },
    {
      accessorKey: 'skills',
      header: 'Top Skills',
      cell: ({ row }) => {
        const skills = row.original.skills?.slice(0, 3) || [];
        const totalSkills = row.original.skills?.length || 0;
        
        return (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
            {totalSkills > 3 && (
              <Badge variant="outline" className="text-xs">
                +{totalSkills - 3}
              </Badge>
            )}
          </div>
        );
      },
      size: 200,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const candidate = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewDetails(candidate)}
              className="flex items-center gap-1 cursor-pointer"
            >
              <Eye className="h-3 w-3" />
              Details
            </Button>
            {showSelectButtons && (
              <Button
                variant="default"
                size="sm"
                onClick={(e) => handleSelectForTeam(candidate, e)}
                className="flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="h-3 w-3" />
                Select
              </Button>
            )}
          </div>
        );
      },
      size: showSelectButtons ? 160 : 100,
    },
  ], [handleViewDetails, handleSelectForTeam, showSelectButtons]);

  // Table instance
  const table = useReactTable({
    data: candidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });
  
  // Pagination options
  const pageSizeOptions = [10, 15, 20];

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No candidates found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value: string) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex gap-1">
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

      {/* Status info */}
      <div className="text-sm text-gray-500 text-center">
        Showing {table.getRowModel().rows.length} of {candidates.length} candidates
      </div>
    </div>
  );
}

export default CandidatesDataTable