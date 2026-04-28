import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FilterSearch } from '@/components/patterns/ui-patterns'
import type { FilterConfig, FilterChip } from '@/components/patterns/ui-patterns'
import {
  FlaskConical,
  Settings,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Table2,
  ShieldCheck,
  LayoutGrid,
  List,
  Milestone,
  DraftingCompass,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react'
import { useBetaFeatures } from '@/hooks/useBetaFeatures'
import ProjectOverviewImg from '@/assets/images/BetaFeatures/ProjectOverview.png'
import EvaluationSandboxImg from '@/assets/images/BetaFeatures/EvaluationSandbox.png'
import AISystemProvidersImg from '@/assets/images/BetaFeatures/AISystemProviders.png'
import ResultTypesImg from '@/assets/images/BetaFeatures/ResultTypes.png'

type FeatureType = 'roadmap' | 'experiment'

const typeMeta: Record<
  FeatureType,
  { label: string; icon: typeof Milestone; iconBg: string; iconColor: string }
> = {
  roadmap: {
    label: 'Roadmap',
    icon: Milestone,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-700',
  },
  experiment: {
    label: 'Experiment',
    icon: DraftingCompass,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-700',
  },
}

type ToggleKey = 'reviewMode'

type Feature = {
  title: string
  description: string
  icon: typeof LayoutDashboard
  category: string
  type: FeatureType
  roadmapQuarter?: string
  path?: string
  image?: string
  toggleKey?: ToggleKey
}

const betaFeatures: Feature[] = [
  {
    title: 'Project Overview',
    description: 'View comprehensive project dashboard with metrics, activity, and insights.',
    path: '/project-overview',
    icon: LayoutDashboard,
    category: 'Analytics & Reporting',
    image: ProjectOverviewImg,
    type: 'experiment',
  },
  {
    title: 'Evaluation Sandbox',
    description: 'Test and compare AI models with custom prompts and measure performance instantly.',
    path: '/evaluation-sandbox',
    icon: FlaskConical,
    category: 'Testing & Analysis',
    image: EvaluationSandboxImg,
    type: 'experiment',
  },
  {
    title: 'AI Providers',
    description: 'Configure and manage AI providers with secure API key storage and connection testing.',
    path: '/ai-providers',
    icon: Settings,
    category: 'Configuration',
    image: AISystemProvidersImg,
    type: 'roadmap',
    roadmapQuarter: 'Q4 2025',
  },
  {
    title: 'Result Types',
    description: 'Explore different template components for displaying evaluation results including text, tables, and charts.',
    path: '/result-types',
    icon: FileText,
    category: 'Analytics & Reporting',
    image: ResultTypesImg,
    type: 'roadmap',
    roadmapQuarter: 'Q4 2025',
  },
  {
    title: 'Datasets',
    description: 'Browse and manage datasets used for evaluations, including format details, row counts, and status.',
    path: '/datasets',
    icon: Table2,
    category: 'Data Management',
    image: ResultTypesImg,
    type: 'experiment',
  },
  {
    title: 'Policy Manager',
    description: 'Create, manage, and enforce organizational policies for AI governance across privacy, security, and compliance.',
    path: '/policy-manager',
    icon: ShieldCheck,
    category: 'Governance',
    image: ResultTypesImg,
    type: 'roadmap',
    roadmapQuarter: 'Q1 2026',
  },
  {
    title: 'Review Mode',
    description: 'Enable conversation review and human judgement annotations for evaluation results.',
    icon: ClipboardCheck,
    category: 'Analytics & Reporting',
    type: 'experiment',
    toggleKey: 'reviewMode',
  },
]

type ViewMode = 'card' | 'list'

type BetaFiltersState = {
  type: string[]
  category: string[]
  searchTerm: string
}

const INITIAL_FILTERS: BetaFiltersState = {
  type: [],
  category: [],
  searchTerm: '',
}

export function BetaFeaturesPage() {
  const { getBetaFeature, toggleBetaFeature } = useBetaFeatures()
  const [filters, setFilters] = useState<BetaFiltersState>(INITIAL_FILTERS)
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical'>('recent')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const categories = useMemo(() => {
    const unique = Array.from(new Set(betaFeatures.map((f) => f.category)))
    return unique.sort()
  }, [])

  const primaryFilters: FilterConfig[] = useMemo(
    () => [
      {
        key: 'type',
        label: 'Type',
        type: 'array',
        options: [
          { value: 'experiment', label: 'Experiment' },
          { value: 'roadmap', label: 'Roadmap' },
        ],
      },
      {
        key: 'category',
        label: 'Category',
        type: 'array',
        options: categories.map((c) => ({ value: c, label: c })),
      },
    ],
    [categories]
  )

  const filterChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = []
    filters.type.forEach((value) => {
      chips.push({
        type: 'type',
        value,
        label: `Type: ${value === 'experiment' ? 'Experiment' : 'Roadmap'}`,
      })
    })
    filters.category.forEach((value) => {
      chips.push({ type: 'category', value, label: `Category: ${value}` })
    })
    return chips
  }, [filters.type, filters.category])

  const hasActiveFilters = filters.type.length > 0 || filters.category.length > 0

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: value }))
  }

  const removeFilter = (filterType: string, value: string | number | boolean) => {
    setFilters((prev) => {
      if (filterType === 'type' || filterType === 'category') {
        return { ...prev, [filterType]: prev[filterType].filter((v) => v !== value) }
      }
      return prev
    })
  }

  const clearAllFilters = () => setFilters(INITIAL_FILTERS)

  const filteredFeatures = useMemo(() => {
    const term = filters.searchTerm.trim().toLowerCase()
    const filtered = betaFeatures.filter((feature) => {
      const matchesSearch =
        term === '' ||
        feature.title.toLowerCase().includes(term) ||
        feature.description.toLowerCase().includes(term) ||
        feature.category.toLowerCase().includes(term)
      const matchesType =
        filters.type.length === 0 || filters.type.includes(feature.type)
      const matchesCategory =
        filters.category.length === 0 || filters.category.includes(feature.category)
      return matchesSearch && matchesType && matchesCategory
    })

    if (sortBy === 'alphabetical') {
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    }
    return [...filtered].reverse()
  }, [filters, sortBy])

  return (
    <div className="min-h-screen bg-gray-0">
      <main className="mx-auto">
        <div className="space-y-12">
          {/* Hero Section */}
          <div
            className="relative overflow-hidden bg-cover bg-center px-6 py-32 m-0.5 rounded-md text-center"
            style={{ backgroundImage: 'url(/src/assets/images/LabCover.png)' }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative z-10 mx-auto max-w-3xl space-y-4">
              <p className="text-[0.8125rem]  font-450 uppercase tracking-wider text-white">
                Design Workspace
              </p>
              <h1 className="text-4xl font-450 text-white md:text-4xl">
                Dynamo HumanAI Experience Lab
              </h1>
              <p className="text-base  text-white/80 md:text-md">
                Try and experiment with ideas that are conceptualized for DynamoAI.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="px-6">
            <div className="mx-auto max-w-4xl">
              <div className="mb-4">
                <FilterSearch
                  searchPlaceholder="Search Features..."
                  searchValue={filters.searchTerm}
                  onSearchChange={handleSearchChange}
                  primaryFilters={primaryFilters}
                  filterValues={filters}
                  onFilterChange={handleFilterChange}
                  filterChips={filterChips}
                  onRemoveFilter={removeFilter}
                  onClearAll={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                  rightContent={
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            aria-label="Sort"
                            className="h-7 w-7 border-gray-300 p-0 text-gray-700"
                          >
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[180px]">
                          <DropdownMenuRadioGroup
                            value={sortBy}
                            onValueChange={(v) =>
                              setSortBy(v as 'recent' | 'alphabetical')
                            }
                          >
                            <DropdownMenuRadioItem value="recent">
                              Recently Added
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="alphabetical">
                              Alphabetical
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <div className="flex items-center rounded-xl bg-gray-100 p-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode('card')}
                          aria-label="Card View"
                          aria-pressed={viewMode === 'card'}
                          className={`h-6 w-6 p-0 transition-all ${
                            viewMode === 'card'
                              ? 'bg-gray-0 text-gray-900 shadow-sm hover:bg-gray-0'
                              : 'bg-transparent text-gray-500 hover:bg-transparent hover:text-gray-900'
                          }`}
                        >
                          <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode('list')}
                          aria-label="List View"
                          aria-pressed={viewMode === 'list'}
                          className={`h-6 w-6 p-0 transition-all ${
                            viewMode === 'list'
                              ? 'bg-gray-0 text-gray-900 shadow-sm hover:bg-gray-0'
                              : 'bg-transparent text-gray-500 hover:bg-transparent hover:text-gray-900'
                          }`}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  }
                />
              </div>

              {filteredFeatures.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 py-16 text-center">
                  <p className="text-[0.8125rem] font-450 text-gray-900">No Features Found</p>
                  <p className="mt-1 text-[0.8125rem] text-gray-600">
                    Try adjusting your search or filter.
                  </p>
                </div>
              ) : viewMode === 'card' ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredFeatures.map((feature) => {
                    if (feature.toggleKey) {
                      const isEnabled = getBetaFeature(feature.toggleKey)
                      return (
                        <Card
                          key={feature.title}
                          className="relative border-gray-200 bg-gray-0 shadow-sm"
                        >
                          <CardHeader className="space-y-1 p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-[11px] font-450 uppercase tracking-wider text-gray-500">
                                  {feature.category}
                                </div>
                                <CardTitle className="text-xl font-450">
                                  {feature.title}
                                </CardTitle>
                              </div>
                              <Switch
                                checked={isEnabled}
                                onCheckedChange={() => toggleBetaFeature(feature.toggleKey!)}
                              />
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 p-4 pt-0">
                            <CardDescription className="text-[0.8125rem] leading-relaxed text-gray-600">
                              {feature.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      )
                    }
                    return (
                      <NavLink key={feature.title} to={feature.path!} className="block">
                        <Card className="relative border-none bg-transparent shadow-none rounded-none">
                          {/* Visual Preview Area */}
                          <div
                            className="aspect-video rounded-lg bg-cover bg-center transition-transform hover:scale-[1.02]"
                            style={{ backgroundImage: `url(${feature.image})` }}
                          >
                            <div className="flex h-full items-center justify-center"></div>
                          </div>

                          {/* Content */}
                          <CardHeader className="space-y-1 p-0 pt-4 pb-2">
                            <div className="text-[11px] font-450 uppercase tracking-wider text-muted-foreground">
                              {feature.category}
                            </div>
                            <CardTitle className="text-xl font-450">
                              {feature.title}
                            </CardTitle>
                          </CardHeader>

                          <CardContent className="space-y-2 p-0">
                            <CardDescription className="text-[0.8125rem]  leading-relaxed text-gray-600">
                              {feature.description}
                            </CardDescription>
                          </CardContent>
                        </Card>
                      </NavLink>
                    )
                  })}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredFeatures.map((feature) => {
                    const meta = typeMeta[feature.type]
                    const TypeIcon = meta.icon
                    const isToggle = !!feature.toggleKey
                    const isEnabled = isToggle ? getBetaFeature(feature.toggleKey!) : false
                    const typeLabel =
                      feature.type === 'roadmap' && feature.roadmapQuarter
                        ? `${meta.label} ${feature.roadmapQuarter}`
                        : meta.label

                    const rowContent = (
                      <>
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${meta.iconBg}`}
                        >
                          <TypeIcon className={`h-4 w-4 ${meta.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[0.8125rem] text-gray-900">
                            <span className="font-450">{feature.title}</span>
                            <span className="px-1.5 text-gray-300">/</span>
                            <span className="font-450 text-gray-600">{typeLabel}</span>
                          </p>
                          <p className="truncate text-[0.8125rem] text-gray-500">
                            {feature.category}
                            <span className="px-1 text-gray-400">›</span>
                            <span className="text-gray-500">{feature.description}</span>
                          </p>
                        </div>
                        {isToggle ? (
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => toggleBetaFeature(feature.toggleKey!)}
                            aria-label={`Enable ${feature.title}`}
                          />
                        ) : (
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        )}
                      </>
                    )

                    return isToggle ? (
                      <div
                        key={feature.title}
                        className="flex items-center gap-4 px-4 py-3"
                      >
                        {rowContent}
                      </div>
                    ) : (
                      <NavLink
                        key={feature.title}
                        to={feature.path!}
                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50"
                        aria-label={`View ${feature.title} Prototype`}
                      >
                        {rowContent}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}