'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Circle,
  Eye,
  PlayCircle,
  Trash2,
  MoreHorizontal,
  AlertCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ============ Types ============

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type SortDirection = 'asc' | 'desc' | null

export interface ColumnDef<T> {
  id: string
  header: string | React.ReactNode
  accessorKey?: keyof T
  accessorFn?: (row: T) => unknown
  cell?: (row: T, index: number) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  hidden?: boolean
}

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  defaultValue?: string
}

export interface BulkAction<T> {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  onClick: (selectedItems: T[]) => void | Promise<void>
}

export interface UniversalDataTableProps<T extends { id: string }> {
  data: T[]
  columns: ColumnDef<T>[]
  // Pagination
  pageSize?: number
  pageSizeOptions?: number[]
  // Search
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  // Filtering
  filters?: FilterConfig[]
  // Selection & Bulk Actions
  selectable?: boolean
  bulkActions?: BulkAction<T>[]
  // Row Actions
  onRowClick?: (row: T) => void
  rowHref?: (row: T) => string
  // Styling
  className?: string
  emptyState?: React.ReactNode
  loading?: boolean
  // Callbacks
  onSort?: (columnId: string, direction: SortDirection) => void
  onFilter?: (filters: Record<string, string>) => void
  onSearch?: (query: string) => void
}

// ============ Helper Functions ============

function getValue<T>(row: T, column: ColumnDef<T>): unknown {
  if (column.accessorFn) return column.accessorFn(row)
  if (column.accessorKey) return row[column.accessorKey]
  return null
}

function compareValues(a: unknown, b: unknown, direction: SortDirection): number {
  if (direction === null) return 0

  const multiplier = direction === 'asc' ? 1 : -1

  if (a === null || a === undefined) return 1 * multiplier
  if (b === null || b === undefined) return -1 * multiplier

  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b) * multiplier
  }

  if (typeof a === 'number' && typeof b === 'number') {
    return (a - b) * multiplier
  }

  return String(a).localeCompare(String(b)) * multiplier
}

function matchesSearch<T>(row: T, query: string, searchKeys: (keyof T)[]): boolean {
  if (!query) return true
  const lowerQuery = query.toLowerCase()

  return searchKeys.some((key) => {
    const value = row[key]
    if (value === null || value === undefined) return false
    return String(value).toLowerCase().includes(lowerQuery)
  })
}

// ============ Component ============

export function UniversalDataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  filters = [],
  selectable = false,
  bulkActions = [],
  onRowClick,
  rowHref,
  className,
  emptyState,
  loading = false,
  onSort,
  onFilter,
  onSearch,
}: UniversalDataTableProps<T>) {
  // State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(pageSize)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Visible columns
  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden),
    [columns]
  )

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchQuery && searchKeys.length > 0) {
      result = result.filter((row) => matchesSearch(row, searchQuery, searchKeys))
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((row) => {
          const rowValue = (row as Record<string, unknown>)[key]
          return String(rowValue).toLowerCase() === value.toLowerCase()
        })
      }
    })

    // Apply sorting
    if (sortColumn && sortDirection) {
      const column = columns.find((col) => col.id === sortColumn)
      if (column) {
        result.sort((a, b) => {
          const aValue = getValue(a, column)
          const bValue = getValue(b, column)
          return compareValues(aValue, bValue, sortDirection)
        })
      }
    }

    return result
  }, [data, searchQuery, searchKeys, activeFilters, sortColumn, sortDirection, columns])

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = processedData.slice(startIndex, endIndex)

  // Selection
  const allSelected = currentData.length > 0 && currentData.every((row) => selectedIds.has(row.id))
  const someSelected = currentData.some((row) => selectedIds.has(row.id))
  const selectedItems = useMemo(
    () => data.filter((row) => selectedIds.has(row.id)),
    [data, selectedIds]
  )

  // Handlers
  const handleSort = useCallback((columnId: string) => {
    let newDirection: SortDirection
    if (sortColumn !== columnId) {
      newDirection = 'asc'
    } else if (sortDirection === 'asc') {
      newDirection = 'desc'
    } else {
      newDirection = null
    }

    setSortColumn(newDirection ? columnId : null)
    setSortDirection(newDirection)
    onSort?.(columnId, newDirection)
  }, [sortColumn, sortDirection, onSort])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
    onSearch?.(query)
  }, [onSearch])

  const handleFilterChange = useCallback((key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    setCurrentPage(1)
    onFilter?.(newFilters)
  }, [activeFilters, onFilter])

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(currentData.map((row) => row.id)))
    }
  }, [allSelected, currentData])

  const handleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Render sort icon
  const renderSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />
  }

  if (loading) {
    return <UniversalDataTableSkeleton columns={visibleColumns.length} />
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      {(searchable || filters.length > 0 || (selectable && selectedIds.size > 0)) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            {/* Search */}
            {searchable && (
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={() => handleSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Filters */}
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={activeFilters[filter.key] || 'all'}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>

          {/* Bulk Actions */}
          {selectable && selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              {bulkActions.map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={() => {
                    action.onClick(selectedItems)
                    clearSelection()
                  }}
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) {
                        (el as HTMLInputElement & { indeterminate?: boolean }).indeterminate =
                          someSelected && !allSelected
                      }
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.width,
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.id)}
                      className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {column.header}
                      {renderSortIcon(column.id)}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                  className="h-32"
                >
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8">
                      <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                      <div className="space-y-2 text-center">
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          No data available
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {searchQuery || Object.keys(activeFilters).length > 0
                            ? 'Try adjusting your search or filter criteria'
                            : 'Data will appear here once available'}
                        </p>
                      </div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row, rowIndex) => {
                const isSelected = selectedIds.has(row.id)
                const href = rowHref?.(row)

                const RowWrapper = href ? Link : 'div'
                const rowProps = href ? { href } : {}

                return (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'group transition-colors',
                      isSelected && 'bg-primary/5',
                      (onRowClick || href) && 'cursor-pointer hover:bg-muted/50'
                    )}
                    onClick={() => !selectable && onRowClick?.(row)}
                  >
                    {selectable && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                          aria-label={`Select row ${rowIndex + 1}`}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right'
                        )}
                      >
                        {column.cell
                          ? column.cell(row, startIndex + rowIndex)
                          : String(getValue(row, column) ?? '')}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {processedData.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages || 1} ({processedData.length} total)
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============ Skeleton ============

export function UniversalDataTableSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ============ Preset Column Helpers ============

export function createIndexColumn<T extends { id: string }>(): ColumnDef<T> {
  return {
    id: 'index',
    header: '#',
    width: 'w-16',
    cell: (_, index) => (
      <span className="font-mono text-sm text-muted-foreground">{index + 1}</span>
    ),
  }
}

export function createTitleColumn<T extends { id: string; title?: string | null }>(
  options?: {
    href?: (row: T) => string
    maxLength?: number
  }
): ColumnDef<T> {
  return {
    id: 'title',
    header: 'Title',
    accessorKey: 'title' as keyof T,
    sortable: true,
    cell: (row) => {
      const title = row.title || 'Untitled'
      const truncated = options?.maxLength && title.length > options.maxLength
        ? `${title.slice(0, options.maxLength)}...`
        : title

      if (options?.href) {
        return (
          <Link
            href={options.href(row)}
            className="text-foreground hover:text-primary hover:underline decoration-primary/30 underline-offset-4 transition-colors"
          >
            {truncated}
          </Link>
        )
      }

      return <span>{truncated}</span>
    },
  }
}

export function createDifficultyColumn<T extends { difficulty?: Difficulty | string | null }>(): ColumnDef<T> {
  return {
    id: 'difficulty',
    header: 'Difficulty',
    accessorKey: 'difficulty' as keyof T,
    sortable: true,
    width: 'w-32',
    align: 'center',
    cell: (row) => {
      const difficulty = (row.difficulty || 'Medium') as string
      const normalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()

      const colorClass = {
        Hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        Easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      }[normalized] || 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'

      return (
        <Badge variant="outline" className={cn('border-0 font-normal', colorClass)}>
          {normalized}
        </Badge>
      )
    },
  }
}

export function createStatusColumn<T extends { practiceCount?: number; practicedCount?: number }>(): ColumnDef<T> {
  return {
    id: 'status',
    header: 'Status',
    width: 'w-24',
    align: 'center',
    cell: (row) => {
      const count = row.practiceCount ?? row.practicedCount ?? 0
      const practiced = count > 0

      return practiced ? (
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="rounded-full bg-gray-100 p-1 dark:bg-gray-800">
            <Circle className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )
    },
  }
}

export function createPracticeCountColumn<T extends { practiceCount?: number; practicedCount?: number }>(): ColumnDef<T> {
  return {
    id: 'practiceCount',
    header: 'Practiced',
    width: 'w-24',
    align: 'center',
    sortable: true,
    cell: (row) => {
      const count = row.practiceCount ?? row.practicedCount ?? 0
      return (
        <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
          <Eye className="h-3.5 w-3.5" /> {count}
        </span>
      )
    },
  }
}

export function createBookmarkColumn<T extends { id: string; bookmarked?: boolean }>(
  onToggle?: (row: T) => void
): ColumnDef<T> {
  return {
    id: 'bookmark',
    header: '',
    width: 'w-12',
    align: 'center',
    cell: (row) => {
      const Icon = row.bookmarked ? BookmarkCheck : Bookmark
      return (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle?.(row)
          }}
          className={cn(
            'p-1 rounded hover:bg-muted transition-colors',
            row.bookmarked && 'text-yellow-500'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      )
    },
  }
}

export function createActionsColumn<T extends { id: string }>(
  options: {
    practiceHref?: (row: T) => string
    onDelete?: (row: T) => void
    onEdit?: (row: T) => void
    additionalActions?: Array<{
      label: string
      icon?: React.ReactNode
      onClick: (row: T) => void
    }>
  }
): ColumnDef<T> {
  return {
    id: 'actions',
    header: '',
    width: 'w-24',
    align: 'right',
    cell: (row) => {
      const hasDropdownActions = options.onDelete || options.onEdit || options.additionalActions?.length

      return (
        <div className="flex items-center justify-end gap-1">
          {options.practiceHref && (
            <Link href={options.practiceHref(row)} onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="default">
                <PlayCircle className="mr-1 h-4 w-4" />
                Practice
              </Button>
            </Link>
          )}

          {hasDropdownActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {options.onEdit && (
                  <DropdownMenuItem onClick={() => options.onEdit?.(row)}>
                    Edit
                  </DropdownMenuItem>
                )}
                {options.additionalActions?.map((action, i) => (
                  <DropdownMenuItem key={i} onClick={() => action.onClick(row)}>
                    {action.icon}
                    <span className={action.icon ? 'ml-2' : ''}>{action.label}</span>
                  </DropdownMenuItem>
                ))}
                {options.onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => options.onDelete?.(row)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )
    },
  }
}
