import React from 'react';
import SkeletonLoader from './components/SkeletonLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Placeholder */}
      <div className="h-16 border-b border-slate-200 flex items-center px-4 sm:px-6 lg:px-8">
        <SkeletonLoader className="h-8 w-40" />
        <div className="ml-auto hidden lg:flex gap-8">
            <SkeletonLoader className="h-4 w-24" />
            <SkeletonLoader className="h-4 w-24" />
            <SkeletonLoader className="h-4 w-24" />
            <SkeletonLoader className="h-4 w-24" />
        </div>
      </div>

      {/* Hero Placeholder */}
      <div className="relative h-[500px] w-full bg-slate-50 overflow-hidden">
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-full max-w-4xl px-4 space-y-6">
                 <SkeletonLoader className="h-12 w-3/4 mx-auto" />
                 <SkeletonLoader className="h-6 w-1/2 mx-auto" />
                 <div className="flex justify-center gap-4 pt-4">
                     <SkeletonLoader className="h-12 w-40" />
                     <SkeletonLoader className="h-12 w-40" />
                 </div>
             </div>
         </div>
      </div>

      {/* Content Placeholder */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SkeletonLoader className="h-64 w-full" />
              <SkeletonLoader className="h-64 w-full" />
              <SkeletonLoader className="h-64 w-full" />
          </div>
          <div className="space-y-4 pt-8">
              <SkeletonLoader className="h-6 w-1/3" />
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-3/4" />
          </div>
      </div>
    </div>
  );
}
