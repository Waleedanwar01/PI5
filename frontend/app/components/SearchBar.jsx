"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current search query from URL params
  const currentQuery = searchParams.get('q') || '';

  useEffect(() => {
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  // Debounced live suggestions
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const qs = new URLSearchParams({ search: searchQuery.trim(), limit: '5' }).toString();
        const res = await fetch(`/api/blogs?${qs}`, { cache: 'no-store', signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.blogs || [];
          setSuggestions(list.slice(0, 5));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [searchQuery]);

  const handleSearch = useCallback((e) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    // Always reset to page 1 when searching
    params.delete('page');
    
    const queryString = params.toString();
    router.push(queryString ? `/articles?${queryString}` : '/articles');
  }, [searchQuery, router]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const s = suggestions[activeIndex];
        router.push(`/articles/${encodeURIComponent(String(s.slug || ''))}`);
      } else {
        handleSearch(e);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    router.push('/articles');
  };

  return (
    <div className="relative mb-12">
      {/* Clean Modern Search Container - Sharp Design */}
      <div className="bg-white shadow-xl border border-gray-200 overflow-hidden">
        {/* Header with Search Icon */}
        <div className="bg-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Articles
            </h2>
            {searchQuery && (
              <button 
                onClick={clearSearch}
                className="text-blue-100 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors uppercase tracking-wide"
              >
                Clear
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {/* Search Input Section */}
        <div className="p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search insurance articles, guides, tips..."
              className="block w-full pl-12 pr-20 py-4 text-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200 hover:border-gray-300"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold uppercase tracking-wide hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Search'
                )}
              </button>
            </div>
            
            {/* Live Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 shadow-2xl overflow-hidden">
                {suggestions.map((s, idx) => (
                  <button
                    key={String(s.slug || idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => router.push(`/articles/${encodeURIComponent(String(s.slug || ''))}`)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-blue-50 ${idx === activeIndex ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900 line-clamp-1">{s.title}</div>
                      {s.summary && (
                        <div className="text-xs text-gray-500 line-clamp-2">{s.summary}</div>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
                <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Showing top {suggestions.length} results
                  </span>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      handleSearch(e);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wide"
                  >
                    See all results for "{searchQuery.trim()}"
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {!currentQuery && searchQuery.length === 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2 font-medium uppercase tracking-wide">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {['car insurance', 'auto insurance', 'insurance quotes', 'coverage', 'liability', 'comprehensive'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Active Search Display */}
      {currentQuery && (
        <div className="mt-6 pt-6 border-t border-blue-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Active Search
          </h4>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white shadow-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              &ldquo;{currentQuery}&rdquo;
              <button
                onClick={clearSearch}
                className="ml-2 hover:text-blue-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
