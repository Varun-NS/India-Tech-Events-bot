"use client";

import { Search, MapPin, Tag, Calendar as CalendarIcon, X } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  selectedMonth: string;
  setSelectedMonth: (val: string) => void;
  cities: string[];
  categories: string[];
  months: string[];
  onClear: () => void;
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  selectedCategory,
  setSelectedCategory,
  selectedMonth,
  setSelectedMonth,
  cities,
  categories,
  months,
  onClear
}: FilterBarProps) {
  return (
    <div className="sticky top-4 z-40 mb-8 p-4 bg-background/70 backdrop-blur-xl border border-card-border rounded-2xl shadow-sm dark:shadow-white/5 transition-all">
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-card border border-card-border rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/20 transition-all"
            placeholder="Search events by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0">
          {/* City Filter */}
          <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <select
              className="block w-full pl-10 pr-8 py-2.5 bg-card border border-card-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[150px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Tag className="h-4 w-4 text-muted-foreground" />
            </div>
            <select
              className="block w-full pl-10 pr-8 py-2.5 bg-card border border-card-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </div>
            <select
              className="block w-full pl-10 pr-8 py-2.5 bg-card border border-card-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || selectedCity || selectedCategory || selectedMonth) && (
            <button
              onClick={onClear}
              className="flex items-center justify-center px-4 py-2.5 bg-muted text-foreground hover:bg-muted-foreground/20 rounded-xl text-sm font-medium transition-colors"
              title="Clear all filters"
            >
              <X className="h-4 w-4 mr-1.5" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
