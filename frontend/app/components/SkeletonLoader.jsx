import React from 'react';

/**
 * Reusable Skeleton Loader with "Instagram-style" shimmer effect
 * 
 * @param {string} className - Tailwind classes for dimensions and positioning
 * @param {string} variant - 'text', 'circular', 'rectangular' (default)
 */
const SkeletonLoader = ({ className = "", variant = "rectangular" }) => {
  const baseClasses = "relative overflow-hidden bg-slate-200";
  const shimmerClasses = "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent";
  
  const variantClasses = {
    text: "rounded h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.rectangular} ${shimmerClasses} ${className}`} 
    />
  );
};

export default SkeletonLoader;
