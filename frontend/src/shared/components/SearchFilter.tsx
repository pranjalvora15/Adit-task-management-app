import { Search, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { FilterState } from '@/features/tasks/types'

interface SearchFilterProps {
  filters: FilterState
  searchInput: string
  isSearching: boolean
  onSearchChange: (value: string) => void
  onChange: (filters: FilterState) => void
}

export function SearchFilter({ filters, searchInput, isSearching, onSearchChange, onChange }: SearchFilterProps) {
  const hasActiveFilters =
    searchInput !== '' || filters.status !== 'all' || filters.priority !== 'all'

  const reset = () => {
    onSearchChange('')
    onChange({ search: '', status: 'all', priority: 'all' })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground transition-opacity duration-150', isSearching ? 'opacity-0' : 'opacity-100')} />
          <Loader2 style={{ animationDuration: '1.5s' }} className={cn('absolute inset-0 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-muted-foreground transition-opacity duration-150', isSearching ? 'opacity-100' : 'opacity-0')} />
        </span>
        <Input
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <Select
          value={filters.status}
          onValueChange={(v) => onChange({ ...filters, status: v as FilterState['status'] })}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(v) => onChange({ ...filters, priority: v as FilterState['priority'] })}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={reset} title="Clear filters">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
