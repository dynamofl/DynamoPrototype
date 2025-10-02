import { useState } from 'react'
import { FilterSearch, type FilterConfig, type FilterChip } from '@/components/patterns/ui-patterns/filter-search'

interface TeamMemberFilterProps {
  onSearch?: (value: string) => void
  className?: string
}

export function TeamMemberFilter({ onSearch, className }: TeamMemberFilterProps) {
  const [searchValue, setSearchValue] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    role: [],
    status: [],
  })

  // Define primary filters
  const primaryFilters: FilterConfig[] = [
    {
      key: 'role',
      label: 'Role',
      type: 'array',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'member', label: 'Member' },
        { value: 'viewer', label: 'Viewer' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'array',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'pending', label: 'Pending' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ]

  // Define additional filters
  const additionalFilters: FilterConfig[] = []

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    onSearch?.(value)
  }

  // Handle filter change
  const handleFilterChange = (filterKey: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [filterKey]: value,
    }))
    // TODO: Implement actual filtering logic
    console.log('Filter changed:', filterKey, value)
  }

  // Generate filter chips from active filters
  const getFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = []

    Object.entries(filterValues).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        const filter = primaryFilters.find(f => f.key === key)
        if (filter) {
          value.forEach(v => {
            const option = filter.options.find(o => o.value === v)
            if (option) {
              chips.push({
                type: key,
                value: v,
                label: `${filter.label}: ${option.label}`,
              })
            }
          })
        }
      } else if (value !== null && !Array.isArray(value)) {
        const filter = [...primaryFilters, ...additionalFilters].find(f => f.key === key)
        if (filter) {
          const option = filter.options.find(o => o.value === value)
          if (option) {
            chips.push({
              type: key,
              value,
              label: `${filter.label}: ${option.label}`,
            })
          }
        }
      }
    })

    return chips
  }

  // Handle removing a filter chip
  const handleRemoveFilter = (filterType: string, value: string | number | boolean) => {
    setFilterValues(prev => {
      const currentValue = prev[filterType]
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [filterType]: currentValue.filter(v => v !== value),
        }
      }
      return {
        ...prev,
        [filterType]: null,
      }
    })
  }

  // Handle clear all filters
  const handleClearAll = () => {
    setFilterValues({
      role: [],
      status: [],
    })
  }

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterValues).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== null
  )

  return (
    <FilterSearch
      searchPlaceholder="Search Members..."
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      primaryFilters={primaryFilters}
      additionalFilters={additionalFilters}
      filterValues={filterValues}
      onFilterChange={handleFilterChange}
      filterChips={getFilterChips()}
      onRemoveFilter={handleRemoveFilter}
      onClearAll={handleClearAll}
      hasActiveFilters={hasActiveFilters}
    />
  )
}
