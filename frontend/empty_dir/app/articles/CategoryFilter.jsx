"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ArticleFilters() {
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Current filter values
  const currentCategory = searchParams.get('category') || '';
  const currentState = searchParams.get('state') || '';
  const currentCompany = searchParams.get('company') || '';

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true);
      
      try {
        // Fetch all filters in parallel
        const [categoriesRes, statesRes, companiesRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/categories?type=states'),
          fetch('/api/categories?type=companies')
        ]);
        
        const [categoriesData, statesData, companiesData] = await Promise.all([
          categoriesRes.json(),
          statesRes.json(),
          companiesRes.json()
        ]);
        
        setCategories(categoriesData.categories || []);
        setStates(statesData.categories || []);
        setCompanies(companiesData.categories || []);
      } catch (err) {
        console.error('Failed to fetch filters:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilters();
  }, []);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset to page 1 when changing filters
    params.delete('page');
    router.push(`/articles?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/articles');
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-orange-50 dark:from-neutral-800 dark:to-neutral-700 rounded-2xl shadow-xl border border-blue-200 dark:border-neutral-600 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filter Articles</h3>
        </div>
        {(currentCategory || currentState || currentCompany) && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Filter */}
        <div className="group">
          <label htmlFor="category-filter" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🚗 Vehicle Categories
          </label>
          <select
            id="category-filter"
            value={currentCategory}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-neutral-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm font-medium transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-500"
            disabled={loading}
          >
            <option value="">All Vehicle Categories</option>
            {categories.map(cat => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* State Filter */}
        <div className="group">
          <label htmlFor="state-filter" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🗺️ State Coverage
          </label>
          <select
            id="state-filter"
            value={currentState}
            onChange={(e) => updateFilter('state', e.target.value)}
            className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-neutral-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm font-medium transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-500"
            disabled={loading}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state.slug} value={state.slug}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* Company Filter */}
        <div className="group">
          <label htmlFor="company-filter" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            🏢 Insurance Companies
          </label>
          <select
            id="company-filter"
            value={currentCompany}
            onChange={(e) => updateFilter('company', e.target.value)}
            className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-neutral-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm font-medium transition-all duration-200 hover:border-green-300 dark:hover:border-green-500"
            disabled={loading}
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company.slug} value={company.slug}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {/* Active Filters Display */}
      {(currentCategory || currentState || currentCompany) && (
        <div className="mt-6 pt-6 border-t-2 border-gradient-to-r from-blue-200 to-orange-200 dark:border-neutral-600">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-3">
            {currentCategory && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                🚗 {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                <button
                  onClick={() => updateFilter('category', '')}
                  className="ml-1 w-5 h-5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentState && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                🗺️ {states.find(s => s.slug === currentState)?.name || currentState}
                <button
                  onClick={() => updateFilter('state', '')}
                  className="ml-1 w-5 h-5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
            {currentCompany && (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200">
                🏢 {companies.find(c => c.slug === currentCompany)?.name || currentCompany}
                <button
                  onClick={() => updateFilter('company', '')}
                  className="ml-1 w-5 h-5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            )}
          </div>
        </div>
      )}
      {(currentCategory || currentState || currentCompany) && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex flex-wrap gap-2">
            {currentCategory && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Category: {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                <button
                  onClick={() => updateFilter('category', '')}
                  className="ml-2 text-orange-600 hover:text-orange-800"
                >
                  ×
                </button>
              </span>
            )}
            {currentState && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                State: {states.find(s => s.slug === currentState)?.name || currentState}
                <button
                  onClick={() => updateFilter('state', '')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {currentCompany && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Company: {companies.find(c => c.slug === currentCompany)?.name || currentCompany}
                <button
                  onClick={() => updateFilter('company', '')}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}