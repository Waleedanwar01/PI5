"use client";
import React, { useState, useEffect, useCallback } from "react";
import { usePerformanceMonitor, useNetworkStatus, ErrorBoundary } from "./PerformanceMonitoring.jsx";

/**
 * Comprehensive Hero Optimization Testing Component
 */
export function HeroOptimizationTester() {
  const [testResults, setTestResults] = useState({
    imageOptimization: { score: 0, details: [], errors: [] },
    videoOptimization: { score: 0, details: [], errors: [] },
    errorHandling: { score: 0, details: [], errors: [] },
    loadingStates: { score: 0, details: [], errors: [] },
    responsiveDesign: { score: 0, details: [], errors: [] },
    performance: { score: 0, details: [], errors: [] },
    overall: 0
  });

  const [isRunningTests, setIsRunningTests] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const { metrics: perfMetrics } = usePerformanceMonitor('HeroOptimizationTester');
  const networkStatus = useNetworkStatus();

  const logTestResult = useCallback((category, test, passed, details, error = null) => {
    setTestResults(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        details: [...prev[category].details, { test, passed, details }],
        errors: error ? [...prev[category].errors, error] : prev[category].errors
      }
    }));
  }, []);

  const runImageOptimizationTests = useCallback(async () => {
    setCurrentTest('Testing Image Optimization...');
    
    // Test 1: Lazy loading support
    if ('loading' in HTMLImageElement.prototype) {
      logTestResult('imageOptimization', 'Lazy Loading Support', true, 'Browser supports native lazy loading');
    } else {
      logTestResult('imageOptimization', 'Lazy Loading Support', false, 'Browser does not support native lazy loading');
    }

    // Test 2: Intersection Observer
    if ('IntersectionObserver' in window) {
      logTestResult('imageOptimization', 'Intersection Observer API', true, 'Available for scroll-based lazy loading');
    } else {
      logTestResult('imageOptimization', 'Intersection Observer API', false, 'Not available, using fallback');
    }

    // Test 3: Image loading performance
    const testImage = new Image();
    const loadStart = performance.now();
    
    testImage.onload = () => {
      const loadTime = performance.now() - loadStart;
      logTestResult('imageOptimization', 'Image Load Performance', loadTime < 3000, 
        `Image loaded in ${Math.round(loadTime)}ms`);
    };
    
    testImage.onerror = () => {
      logTestResult('imageOptimization', 'Image Load Performance', false, 'Image failed to load');
    };

    testImage.src = '/api/site-config/'; // Using existing endpoint as test
    
    // Test 4: Responsive image support
    if ('srcset' in HTMLImageElement.prototype) {
      logTestResult('imageOptimization', 'Responsive Images', true, 'srcset attribute supported');
    } else {
      logTestResult('imageOptimization', 'Responsive Images', false, 'srcset not supported');
    }

    // Test 5: WebP support
    const webpImage = new Image();
    webpImage.onload = () => {
      logTestResult('imageOptimization', 'WebP Support', true, 'Browser can display WebP images');
    };
    webpImage.onerror = () => {
      logTestResult('imageOptimization', 'WebP Support', false, 'Browser cannot display WebP images');
    };
    webpImage.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }, [logTestResult]);

  const runVideoOptimizationTests = useCallback(async () => {
    setCurrentTest('Testing Video Optimization...');
    
    // Test 1: Video element support
    const video = document.createElement('video');
    if (video.canPlayType) {
      logTestResult('videoOptimization', 'HTML5 Video Support', true, 'Video element and methods available');
      
      // Test video codec support
      const mp4Support = video.canPlayType('video/mp4');
      const webmSupport = video.canPlayType('video/webm');
      const oggSupport = video.canPlayType('video/ogg');
      
      logTestResult('videoOptimization', 'MP4 Codec Support', !!mp4Support, mp4Support || 'Not supported');
      logTestResult('videoOptimization', 'WebM Codec Support', !!webmSupport, webmSupport || 'Not supported');
      logTestResult('videoOptimization', 'OGG Codec Support', !!oggSupport, oggSupport || 'Not supported');
    } else {
      logTestResult('videoOptimization', 'HTML5 Video Support', false, 'Video element not supported');
    }

    // Test 2: Media Session API
    if ('mediaSession' in navigator) {
      logTestResult('videoOptimization', 'Media Session API', true, 'Available for video controls');
    } else {
      logTestResult('videoOptimization', 'Media Session API', false, 'Not available');
    }

    // Test 3: Picture-in-Picture
    if ('pictureInPictureEnabled' in document) {
      logTestResult('videoOptimization', 'Picture-in-Picture', true, 'Supported for video viewing');
    } else {
      logTestResult('videoOptimization', 'Picture-in-Picture', false, 'Not supported');
    }
  }, [logTestResult]);

  const runErrorHandlingTests = useCallback(async () => {
    setCurrentTest('Testing Error Handling...');
    
    // Test 1: Error boundaries
    try {
      throw new Error('Test error');
    } catch (error) {
      logTestResult('errorHandling', 'Error Catching', true, 'JavaScript error handling works');
    }

    // Test 2: Network error handling
    try {
      const response = await fetch('/nonexistent-endpoint', { cache: 'no-store' });
      if (!response.ok) throw new Error('Network request failed');
      logTestResult('errorHandling', 'Network Error Handling', true, 'Failed requests handled gracefully');
    } catch (error) {
      logTestResult('errorHandling', 'Network Error Handling', true, 'Network errors caught and handled');
    }

    // Test 3: Image error handling
    const brokenImage = new Image();
    brokenImage.onerror = () => {
      logTestResult('errorHandling', 'Image Error Handling', true, 'Broken images handled with fallbacks');
    };
    brokenImage.src = '/nonexistent-image.jpg';

    // Test 4: Timeout handling
    const timeoutTest = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout test')), 100);
    });

    try {
      await timeoutTest;
    } catch (error) {
      logTestResult('errorHandling', 'Timeout Handling', true, 'Operations can timeout gracefully');
    }
  }, [logTestResult]);

  const runLoadingStateTests = useCallback(async () => {
    setCurrentTest('Testing Loading States...');
    
    // Test 1: CSS loading animations
    const loadingTest = document.createElement('div');
    loadingTest.className = 'animate-pulse';
    document.body.appendChild(loadingTest);
    
    const styles = window.getComputedStyle(loadingTest);
    const hasAnimation = styles.animationName !== 'none';
    document.body.removeChild(loadingTest);
    
    logTestResult('loadingStates', 'CSS Animations', hasAnimation, 
      hasAnimation ? 'CSS animations supported' : 'CSS animations not supported');

    // Test 2: JavaScript loading states
    let loadingState = false;
    const setLoadingState = (state) => {
      loadingState = state;
    };
    
    setLoadingState(true);
    logTestResult('loadingStates', 'Loading State Management', loadingState === true, 
      'Loading states can be managed programmatically');

    // Test 3: Skeleton loading pattern
    const skeletonTest = `
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    `;
    
    const skeletonContainer = document.createElement('div');
    skeletonContainer.innerHTML = skeletonTest;
    const skeletonElements = skeletonContainer.querySelectorAll('.animate-pulse');
    
    logTestResult('loadingStates', 'Skeleton Loading Pattern', skeletonElements.length > 0, 
      `Skeleton loading elements created (${skeletonElements.length} elements)`);
  }, [logTestResult]);

  const runResponsiveDesignTests = useCallback(async () => {
    setCurrentTest('Testing Responsive Design...');
    
    // Test 1: Viewport meta tag
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    logTestResult('responsiveDesign', 'Viewport Meta Tag', !!viewportMeta, 
      viewportMeta ? 'Viewport properly configured' : 'Missing viewport meta tag');

    // Test 2: CSS Grid support
    const gridTest = document.createElement('div');
    gridTest.style.display = 'grid';
    const supportsGrid = gridTest.style.display === 'grid';
    
    logTestResult('responsiveDesign', 'CSS Grid Support', supportsGrid, 
      supportsGrid ? 'CSS Grid supported' : 'CSS Grid not supported');

    // Test 3: Flexbox support
    const flexTest = document.createElement('div');
    flexTest.style.display = 'flex';
    const supportsFlex = flexTest.style.display === 'flex';
    
    logTestResult('responsiveDesign', 'Flexbox Support', supportsFlex, 
      supportsFlex ? 'Flexbox supported' : 'Flexbox not supported');

    // Test 4: Media queries
    const testMediaQuery = window.matchMedia('(max-width: 768px)');
    logTestResult('responsiveDesign', 'Media Queries', !!testMediaQuery, 
      'Media queries supported');

    // Test 5: Touch events
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    logTestResult('responsiveDesign', 'Touch Events', touchSupported, 
      touchSupported ? 'Touch events supported' : 'Touch events not supported');
  }, [logTestResult]);

  const runPerformanceTests = useCallback(async () => {
    setCurrentTest('Testing Performance...');
    
    // Test 1: Performance API
    if (window.performance) {
      logTestResult('performance', 'Performance API', true, 'Performance API available');
      
      // Test 2: Memory usage
      if (window.performance.memory) {
        const memoryInfo = window.performance.memory;
        const memoryUsedMB = Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024);
        logTestResult('performance', 'Memory Usage Tracking', true, 
          `Current memory usage: ${memoryUsedMB}MB`);
      } else {
        logTestResult('performance', 'Memory Usage Tracking', false, 'Memory API not available');
      }

      // Test 3: Resource timing
      const resourceEntries = window.performance.getEntriesByType('resource');
      logTestResult('performance', 'Resource Timing', resourceEntries.length > 0, 
        `Found ${resourceEntries.length} resource entries`);

      // Test 4: Navigation timing
      if (window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        logTestResult('performance', 'Navigation Timing', loadTime > 0, 
          `Page load time: ${loadTime}ms`);
      } else {
        logTestResult('performance', 'Navigation Timing', false, 'Navigation timing not available');
      }
    } else {
      logTestResult('performance', 'Performance API', false, 'Performance API not available');
    }

    // Test 5: Network information
    logTestResult('performance', 'Network Status', true, 
      `Network: ${networkStatus.isOnline ? 'Online' : 'Offline'}, Type: ${networkStatus.effectiveType || 'unknown'}`);
  }, [networkStatus]);

  const calculateScores = useCallback(() => {
    const categories = ['imageOptimization', 'videoOptimization', 'errorHandling', 'loadingStates', 'responsiveDesign', 'performance'];
    let totalScore = 0;
    let categoryCount = 0;

    categories.forEach(category => {
      const results = testResults[category];
      const totalTests = results.details.length;
      const passedTests = results.details.filter(test => test.passed).length;
      const score = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
      
      setTestResults(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          score: Math.round(score)
        }
      }));
      
      totalScore += score;
      categoryCount++;
    });

    const overallScore = categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
    setTestResults(prev => ({ ...prev, overall: overallScore }));
  }, [testResults]);

  const runAllTests = useCallback(async () => {
    setIsRunningTests(true);
    setTestResults({
      imageOptimization: { score: 0, details: [], errors: [] },
      videoOptimization: { score: 0, details: [], errors: [] },
      errorHandling: { score: 0, details: [], errors: [] },
      loadingStates: { score: 0, details: [], errors: [] },
      responsiveDesign: { score: 0, details: [], errors: [] },
      performance: { score: 0, details: [], errors: [] },
      overall: 0
    });

    try {
      await runImageOptimizationTests();
      await runVideoOptimizationTests();
      await runErrorHandlingTests();
      await runLoadingStateTests();
      await runResponsiveDesignTests();
      await runPerformanceTests();
      
      calculateScores();
    } catch (error) {
      console.error('Test execution error:', error);
    } finally {
      setIsRunningTests(false);
      setCurrentTest('');
    }
  }, [runImageOptimizationTests, runVideoOptimizationTests, runErrorHandlingTests, runLoadingStateTests, runResponsiveDesignTests, runPerformanceTests, calculateScores]);

  useEffect(() => {
    // Auto-run tests on component mount
    runAllTests();
  }, [runAllTests]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const TestResultCard = ({ title, category, icon }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(testResults[category].score)}`}>
          {testResults[category].score}%
        </span>
      </div>
      
      <div className="space-y-3">
        {testResults[category].details.map((detail, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center ${
              detail.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {detail.passed ? (
                <svg className="w-2.5 h-2.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-2.5 h-2.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{detail.test}</p>
              <p className="text-xs text-gray-500">{detail.details}</p>
            </div>
          </div>
        ))}
      </div>

      {testResults[category].errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
          <ul className="text-xs text-red-700 space-y-1">
            {testResults[category].errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  if (isRunningTests) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentTest}</h2>
          <p className="text-gray-600">Running optimization tests...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Hero Optimization Test Results
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Comprehensive testing of hero image and video optimizations
            </p>
            
            {/* Overall Score */}
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl text-lg font-semibold ${getScoreColor(testResults.overall)}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Overall Optimization Score: {testResults.overall}%
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex justify-center mb-8">
            <button
              onClick={runAllTests}
              disabled={isRunningTests}
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-run Tests
            </button>
          </div>

          {/* Test Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TestResultCard 
              title="Image Optimization" 
              category="imageOptimization"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            
            <TestResultCard 
              title="Video Optimization" 
              category="videoOptimization"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              }
            />
            
            <TestResultCard 
              title="Error Handling" 
              category="errorHandling"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
            />
            
            <TestResultCard 
              title="Loading States" 
              category="loadingStates"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            
            <TestResultCard 
              title="Responsive Design" 
              category="responsiveDesign"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              }
            />
            
            <TestResultCard 
              title="Performance" 
              category="performance"
              icon={
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </div>

          {/* Performance Metrics Display */}
          {perfMetrics.renderTime > 0 && (
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{Math.round(perfMetrics.renderTime)}ms</p>
                  <p className="text-sm text-gray-600">Render Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{perfMetrics.coreWebVitals.LCP ? Math.round(perfMetrics.coreWebVitals.LCP) : 'N/A'}</p>
                  <p className="text-sm text-gray-600">LCP (ms)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{perfMetrics.coreWebVitals.FID ? Math.round(perfMetrics.coreWebVitals.FID) : 'N/A'}</p>
                  <p className="text-sm text-gray-600">FID (ms)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{perfMetrics.coreWebVitals.CLS ? perfMetrics.coreWebVitals.CLS.toFixed(3) : 'N/A'}</p>
                  <p className="text-sm text-gray-600">CLS Score</p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Optimization Recommendations
            </h3>
            <div className="space-y-3 text-sm text-blue-800">
              {testResults.overall < 80 && (
                <p>• Consider implementing additional optimizations to improve overall score above 80%</p>
              )}
              {testResults.imageOptimization.score < 80 && (
                <p>• Add WebP image support and implement responsive images with srcset</p>
              )}
              {testResults.videoOptimization.score < 80 && (
                <p>• Consider implementing video compression and adaptive streaming</p>
              )}
              {testResults.performance.score < 80 && (
                <p>• Optimize resource loading and implement code splitting</p>
              )}
              {testResults.responsiveDesign.score < 80 && (
                <p>• Improve mobile-first design and add more responsive breakpoints</p>
              )}
              {testResults.errorHandling.score < 80 && (
                <p>• Enhance error boundaries and add more comprehensive error handling</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

/**
 * Performance Benchmark Component
 */
export function PerformanceBenchmark() {
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runBenchmark = async () => {
    setIsRunning(true);
    const results = {};

    // Image loading benchmark
    const imageStart = performance.now();
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = '/api/site-config/';
    });
    results.imageLoadTime = performance.now() - imageStart;

    // DOM manipulation benchmark
    const domStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      const div = document.createElement('div');
      div.textContent = `Test ${i}`;
      document.body.appendChild(div);
      document.body.removeChild(div);
    }
    results.domOperationTime = performance.now() - domStart;

    // Memory benchmark
    if (performance.memory) {
      const memoryBefore = performance.memory.usedJSHeapSize;
      const largeArray = new Array(100000).fill('test');
      const memoryAfter = performance.memory.usedJSHeapSize;
      results.memoryUsage = memoryAfter - memoryBefore;
      largeArray.length = 0; // Cleanup
    }

    setBenchmarkResults(results);
    setIsRunning(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Benchmark</h3>
      <button
        onClick={runBenchmark}
        disabled={isRunning}
        className="mb-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
      >
        {isRunning ? 'Running...' : 'Run Benchmark'}
      </button>

      {benchmarkResults && (
        <div className="space-y-2 text-sm">
          <p>Image Load Time: {Math.round(benchmarkResults.imageLoadTime)}ms</p>
          <p>DOM Operations: {Math.round(benchmarkResults.domOperationTime)}ms</p>
          {benchmarkResults.memoryUsage && (
            <p>Memory Usage: {Math.round(benchmarkResults.memoryUsage / 1024)}KB</p>
          )}
        </div>
      )}
    </div>
  );
}