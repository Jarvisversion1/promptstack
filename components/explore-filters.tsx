'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import {
  TOOLS,
  CATEGORIES,
  DIFFICULTIES,
  SORT_OPTIONS,
  type FilterOption,
} from '@/lib/config/filters'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type ActiveFilter = {
  param: string
  value: string
  label: string
}

/* ================================================================== */
/*  Custom dropdown component                                          */
/* ================================================================== */

const FilterDropdown = ({
  label,
  param,
  options,
  value,
  onChange,
}: {
  label: string
  param: string
  options: FilterOption[]
  value: string | null
  onChange: (param: string, value: string | null) => void
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 font-mono text-xs px-3 py-2 rounded-md border transition-colors whitespace-nowrap ${
          value
            ? 'bg-[#3ddc84]/10 border-[#3ddc84]/20 text-[#3ddc84]/90'
            : 'bg-[#0c0c0f] border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70'
        }`}
      >
        {current?.label ?? label}
        <ChevronDown
          size={12}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] bg-[#0c0c0f] border border-[#1c1c25] rounded-lg shadow-xl overflow-hidden">
          {/* "All" / clear option */}
          <button
            type="button"
            onClick={() => {
              onChange(param, null)
              setOpen(false)
            }}
            className={`w-full text-left font-mono text-xs px-3.5 py-2.5 transition-colors ${
              !value
                ? 'bg-[#1c1c25] text-[#e8e8ed]/80'
                : 'text-[#e8e8ed]/50 hover:bg-[#1c1c25]/60 hover:text-[#e8e8ed]/70'
            }`}
          >
            {label}
          </button>

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(param, opt.value)
                setOpen(false)
              }}
              className={`w-full text-left font-mono text-xs px-3.5 py-2.5 transition-colors ${
                value === opt.value
                  ? 'bg-[#3ddc84]/10 text-[#3ddc84]/90'
                  : 'text-[#e8e8ed]/50 hover:bg-[#1c1c25]/60 hover:text-[#e8e8ed]/70'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Mobile filter panel                                                */
/* ================================================================== */

const MobileFilterPanel = ({
  open,
  onClose,
  tool,
  category,
  difficulty,
  onFilter,
}: {
  open: boolean
  onClose: () => void
  tool: string | null
  category: string | null
  difficulty: string | null
  onFilter: (param: string, value: string | null) => void
}) => {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] bg-[#0c0c0f] border-t border-[#1c1c25] rounded-t-2xl overflow-y-auto">
        <div className="p-5">
          {/* Handle */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-[#1c1c25]" />
          </div>

          <div className="flex items-center justify-between mb-5">
            <h3 className="font-mono text-sm font-semibold">Filters</h3>
            <button
              type="button"
              onClick={onClose}
              className="text-[#e8e8ed]/40 hover:text-[#e8e8ed]/70 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tool */}
          <MobileFilterGroup
            title="Tool"
            options={TOOLS}
            value={tool}
            onChange={(v) => onFilter('tool', v)}
          />

          {/* Category */}
          <MobileFilterGroup
            title="Category"
            options={CATEGORIES}
            value={category}
            onChange={(v) => onFilter('category', v)}
          />

          {/* Difficulty */}
          <MobileFilterGroup
            title="Difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={(v) => onFilter('difficulty', v)}
          />

          {/* Apply */}
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-4 font-mono text-sm py-2.5 rounded-lg bg-[#3ddc84] text-[#09090b] font-semibold hover:bg-[#3ddc84]/90 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}

const MobileFilterGroup = ({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: FilterOption[]
  value: string | null
  onChange: (v: string | null) => void
}) => (
  <div className="mb-5">
    <p className="font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-widest mb-2">
      {title}
    </p>
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={`font-mono text-xs px-3 py-1.5 rounded-md border transition-colors ${
          !value
            ? 'bg-[#3ddc84]/10 border-[#3ddc84]/20 text-[#3ddc84]/90'
            : 'bg-transparent border-[#1c1c25] text-[#e8e8ed]/40 hover:border-[#2a2a35]'
        }`}
      >
        All
      </button>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`font-mono text-xs px-3 py-1.5 rounded-md border transition-colors ${
            value === opt.value
              ? 'bg-[#3ddc84]/10 border-[#3ddc84]/20 text-[#3ddc84]/90'
              : 'bg-transparent border-[#1c1c25] text-[#e8e8ed]/40 hover:border-[#2a2a35]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
)

/* ================================================================== */
/*  Main ExploreFilters component                                      */
/* ================================================================== */

type ExploreFiltersProps = {
  /** Pre-selected tool from the /explore/[filter] SEO route */
  presetTool?: string | null
  /** Pre-selected category from the /explore/[filter] SEO route */
  presetCategory?: string | null
}

export const ExploreFilters = ({
  presetTool = null,
  presetCategory = null,
}: ExploreFiltersProps = {}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [mobileOpen, setMobileOpen] = useState(false)

  /* ---- Read current params (URL overrides preset) ----------------- */
  const tool = searchParams.get('tool') ?? presetTool
  const category = searchParams.get('category') ?? presetCategory
  const difficulty = searchParams.get('difficulty')
  const sort = searchParams.get('sort')
  const search = searchParams.get('search')

  /* ---- Debounced search ------------------------------------------- */
  const [searchInput, setSearchInput] = useState(search ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Sync external changes (e.g. clear-all) back to the input
  useEffect(() => {
    setSearchInput(search ?? '')
  }, [search])

  /**
   * Builds a URLSearchParams that carries over preset values so they
   * survive navigation from the /explore/[filter] SEO route to /explore.
   */
  const buildParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    // Carry over presets if they aren't already in the search params
    if (presetTool && !searchParams.has('tool')) params.set('tool', presetTool)
    if (presetCategory && !searchParams.has('category'))
      params.set('category', presetCategory)
    return params
  }, [searchParams, presetTool, presetCategory])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        const params = buildParams()
        if (value.trim()) {
          params.set('search', value.trim())
        } else {
          params.delete('search')
        }
        params.delete('page')
        startTransition(() => {
          router.push(`/explore?${params.toString()}`, { scroll: false })
        })
      }, 400)
    },
    [router, buildParams, startTransition]
  )

  /* ---- Generic param update --------------------------------------- */
  const updateParam = useCallback(
    (param: string, value: string | null) => {
      const params = buildParams()
      if (value) {
        params.set(param, value)
      } else {
        params.delete(param)
      }
      // Reset page when any filter changes
      if (param !== 'page') params.delete('page')
      startTransition(() => {
        router.push(`/explore?${params.toString()}`, { scroll: false })
      })
    },
    [router, buildParams, startTransition]
  )

  /* ---- Collect active filters for chips --------------------------- */
  const allFilterConfigs: { param: string; options: FilterOption[] }[] = [
    { param: 'tool', options: TOOLS },
    { param: 'category', options: CATEGORIES },
    { param: 'difficulty', options: DIFFICULTIES },
  ]

  const activeFilters: ActiveFilter[] = []
  const effectiveValues: Record<string, string | null> = {
    tool,
    category,
    difficulty,
  }
  for (const cfg of allFilterConfigs) {
    const val = effectiveValues[cfg.param]
    if (val) {
      const opt = cfg.options.find((o) => o.value === val)
      if (opt) {
        activeFilters.push({
          param: cfg.param,
          value: val,
          label: opt.label,
        })
      }
    }
  }
  if (search) {
    activeFilters.push({ param: 'search', value: search, label: `"${search}"` })
  }

  const clearAll = useCallback(() => {
    const params = new URLSearchParams()
    const sortVal = searchParams.get('sort')
    if (sortVal && sortVal !== 'newest') params.set('sort', sortVal)
    startTransition(() => {
      router.push(`/explore${params.toString() ? `?${params.toString()}` : ''}`, {
        scroll: false,
      })
    })
  }, [router, searchParams, startTransition])

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="mb-8">
      {/* ------------------------------------------------------------ */}
      {/*  Desktop filter bar                                           */}
      {/* ------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative sm:w-[40%]">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e8e8ed]/30 pointer-events-none"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search projects..."
            className="w-full font-mono text-xs bg-[#0c0c0f] border border-[#1c1c25] rounded-md pl-9 pr-3 py-2 text-[#e8e8ed]/80 placeholder:text-[#e8e8ed]/25 focus:outline-none focus:border-[#3ddc84]/40 focus:ring-1 focus:ring-[#3ddc84]/20 transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Desktop dropdowns */}
        <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
          <FilterDropdown
            label="All Tools"
            param="tool"
            options={TOOLS}
            value={tool}
            onChange={updateParam}
          />
          <FilterDropdown
            label="All Categories"
            param="category"
            options={CATEGORIES}
            value={category}
            onChange={updateParam}
          />
          <FilterDropdown
            label="All Levels"
            param="difficulty"
            options={DIFFICULTIES}
            value={difficulty}
            onChange={updateParam}
          />
          <div className="w-px h-5 bg-[#1c1c25] mx-1" />
          <FilterDropdown
            label="Newest"
            param="sort"
            options={SORT_OPTIONS}
            value={sort}
            onChange={updateParam}
          />
        </div>

        {/* Mobile: Filters button + Sort dropdown */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className={`flex items-center gap-1.5 font-mono text-xs px-3 py-2 rounded-md border transition-colors ${
              activeFilters.length > 0
                ? 'bg-[#3ddc84]/10 border-[#3ddc84]/20 text-[#3ddc84]/90'
                : 'bg-[#0c0c0f] border-[#1c1c25] text-[#e8e8ed]/50'
            }`}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilters.length > 0 && (
              <span className="bg-[#3ddc84] text-[#09090b] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ml-0.5">
                {activeFilters.length}
              </span>
            )}
          </button>
          <FilterDropdown
            label="Newest"
            param="sort"
            options={SORT_OPTIONS}
            value={sort}
            onChange={updateParam}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Active filter chips                                          */}
      {/* ------------------------------------------------------------ */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {activeFilters.map((f) => (
            <button
              key={f.param}
              type="button"
              onClick={() => updateParam(f.param, null)}
              className="flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-full bg-[#1c1c25] text-[#e8e8ed]/60 hover:text-[#e8e8ed]/80 hover:bg-[#2a2a35] transition-colors"
            >
              {f.label}
              <X size={11} />
            </button>
          ))}
          {activeFilters.length > 1 && (
            <button
              type="button"
              onClick={clearAll}
              className="font-mono text-[11px] text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors ml-1"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Mobile filter panel */}
      <MobileFilterPanel
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        tool={tool}
        category={category}
        difficulty={difficulty}
        onFilter={updateParam}
      />
    </div>
  )
}
