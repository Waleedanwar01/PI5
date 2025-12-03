"use client";
import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Performance Monitoring Hook
 */
export function usePerformanceMonitor(componentName) {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: null,
    resourceTimings: [],
    coreWebVitals: {
      LCP: null, // Largest Contentful Paint
      FID: null, // First Input Delay
      CLS: null, // Cumulative Layout Shift
    }
  });

  const startTimeRef = useRef(performance.now());
  const observerRef = useRef(null);

  // Performance Observer for Core Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    // LCP (Largest Contentful Paint)
    observerRef.current = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        setMetrics(prev => ({
          ...prev,
          coreWebVitals: {
            ...prev.coreWebVitals,
            LCP: lastEntry.startTime
          }
        }));
      }
    });

    observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        setMetrics(prev => ({
          ...prev,
          coreWebVitals: {
            ...prev.coreWebVitals,
            FID: entry.processingStart - entry.startTime
          }
        }));
      });
    });

    fidObserver.observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          setMetrics(prev => ({
            ...prev,
            coreWebVitals: {
              ...prev.coreWebVitals,
              CLS: clsValue
            }
          }));
        }
      });
    });

    clsObserver.observe({ entryTypes: ['layout-shift'] });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);

  // Resource timing collection
  useEffect(() => {
    const collectResourceTimings = () => {
      if (!window.performance || !window.performance.getEntriesByType) return;

      const resourceEntries = window.performance.getEntriesByType('resource');
      const relevantResources = resourceEntries.filter(entry => 
        entry.initiatorType === 'img' || 
        entry.initiatorType === 'video' || 
        entry.initiatorType === 'script' ||
        entry.initiatorType === 'css'
      );

      setMetrics(prev => ({
        ...prev,
        resourceTimings: relevantResources.map(entry => ({
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration,
          size: entry.transferSize,
        }))
      }));
    };

    // Collect resource timings after page load
    if (document.readyState === 'complete') {
      collectResourceTimings();
    } else {
      window.addEventListener('load', collectResourceTimings);
    }

    return () => {
      window.removeEventListener('load', collectResourceTimings);
    };
  }, []);

  // Memory usage (if available)
  useEffect(() => {
    const getMemoryUsage = () => {
      if (window.performance && window.performance.memory) {
        setMetrics(prev => ({
          ...prev,
          memoryUsage: {
            usedJSHeapSize: window.performance.memory.usedJSHeapSize,
            totalJSHeapSize: window.performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
          }
        }));
      }
    };

    getMemoryUsage();
    const interval = setInterval(getMemoryUsage, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const recordRenderTime = useCallback(() => {
    const renderTime = performance.now() - startTimeRef.current;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, []);

  const getLoadTime = useCallback(() => {
    const loadTime = performance.now() - startTimeRef.current;
    setMetrics(prev => ({ ...prev, loadTime }));
    return loadTime;
  }, []);

  const logMetric = useCallback((metricName, value, tags = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`📊 Performance Metric: ${componentName}`);
      console.log(`Metric: ${metricName}`, value);
      console.log('Tags:', tags);
      console.log('All Metrics:', metrics);
      console.groupEnd();
    }

    // In production, you could send this to analytics service
    if (process.env.NODE_ENV === 'production' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        event_category: 'Performance',
        event_label: `${componentName}:${metricName}`,
        value: Math.round(value),
        custom_map: tags,
      });
    }
  }, [componentName, metrics]);

  return {
    metrics,
    recordRenderTime,
    getLoadTime,
    logMetric,
  };
}

/**
 * Error Boundary Component with Performance Tracking
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      performanceData: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capture performance data
    const perfData = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      memoryUsage: performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      } : null,
      navigationTiming: performance.timing ? {
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
      } : null,
      error: error.toString(),
      stack: errorInfo.componentStack,
    };

    this.setState({
      error,
      errorInfo,
      performanceData: perfData
    });

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Performance Data:', perfData);
      console.groupEnd();
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      if (window.Sentry) {
        window.Sentry.captureException(error, {
          extra: {
            ...perfData,
            componentStack: errorInfo.componentStack
          }
        });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                  <pre>{this.state.error?.toString()}</pre>
                  <pre className="mt-2">{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Retry Mechanism for Failed Operations
 */
export function useRetry(operation, maxAttempts = 3, delay = 1000) {
  const [attempts, setAttempts] = useState(0);
  const [lastError, setLastError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setLastError(null);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setAttempts(attempt);
        const result = await operation(...args);
        setIsLoading(false);
        return result;
      } catch (error) {
        setLastError(error);
        
        if (attempt === maxAttempts) {
          setIsLoading(false);
          throw error;
        }
        
        // Exponential backoff with jitter
        const backoffDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }, [operation, maxAttempts, delay]);

  const reset = useCallback(() => {
    setAttempts(0);
    setLastError(null);
    setIsLoading(false);
  }, []);

  return {
    execute,
    reset,
    attempts,
    lastError,
    isLoading,
    canRetry: attempts < maxAttempts && !!lastError,
  };
}

/**
 * Network Status Monitor
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    downlink: null,
    effectiveType: null,
    rtt: null,
    saveData: false,
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        connectionType: connection?.type || 'unknown',
        downlink: connection?.downlink || null,
        effectiveType: connection?.effectiveType || null,
        rtt: connection?.rtt || null,
        saveData: connection?.saveData || false,
      }));
    };

    const handleOnline = () => setNetworkStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setNetworkStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = navigator.connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}

/**
 * Resource Preloader
 */
export function useResourcePreloader() {
  const preloadedResources = useRef(new Set());

  const preloadImage = useCallback((src, options = {}) => {
    if (preloadedResources.current.has(src)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    
    if (options.crossOrigin) {
      link.crossOrigin = options.crossOrigin;
    }
    
    document.head.appendChild(link);
    preloadedResources.current.add(src);

    // Clean up after some time
    setTimeout(() => {
      document.head.removeChild(link);
    }, 5000);
  }, []);

  const preloadVideo = useCallback((src) => {
    if (preloadedResources.current.has(src)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'video';
    link.href = src;
    document.head.appendChild(link);
    preloadedResources.current.add(src);

    setTimeout(() => {
      document.head.removeChild(link);
    }, 5000);
  }, []);

  const preloadFont = useCallback((href, options = {}) => {
    if (preloadedResources.current.has(href)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = href;
    link.type = options.type || 'font/woff2';
    link.crossOrigin = options.crossOrigin || 'anonymous';
    document.head.appendChild(link);
    preloadedResources.current.add(href);

    setTimeout(() => {
      document.head.removeChild(link);
    }, 5000);
  }, []);

  return {
    preloadImage,
    preloadVideo,
    preloadFont,
    preloadedResources: preloadedResources.current,
  };
}

/**
 * Performance Optimized Button Component
 */
export function PerformanceButton({ 
  children, 
  onClick, 
  loading = false, 
  disabled = false,
  className = "",
  type = "button",
  ...props 
}) {
  const [isClicked, setIsClicked] = useState(false);
  const { logMetric } = usePerformanceMonitor('PerformanceButton');

  const handleClick = useCallback((e) => {
    if (loading || disabled) return;

    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);

    const startTime = performance.now();
    onClick?.(e);
    
    // Log click performance
    setTimeout(() => {
      const clickTime = performance.now() - startTime;
      logMetric('button_click_time', clickTime, { 
        loading, 
        disabled,
        hasHandler: !!onClick 
      });
    }, 0);
  }, [loading, disabled, onClick, logMetric]);

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={loading || disabled}
      className={`
        relative overflow-hidden
        transition-all duration-200 ease-out
        transform ${isClicked ? 'scale-95' : 'hover:scale-105'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={`${loading ? 'opacity-50' : ''}`}>
        {children}
      </span>
    </button>
  );
}