"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Advanced Video Player Component with optimization features
 */
export function useOptimizedVideo() {
  const [videoState, setVideoState] = useState({
    isLoaded: false,
    isPlaying: false,
    progress: 0,
    duration: 0,
    error: null,
    isMuted: false,
    volume: 1,
  });

  const videoRef = useRef(null);
  const progressRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!videoRef.current || observerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = videoRef.current;
            if (video && !videoState.isLoaded) {
              video.load(); // Trigger video loading
            }
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    observerRef.current.observe(videoRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [videoState.isLoaded]);

  const handleLoadStart = useCallback(() => {
    setVideoState(prev => ({ ...prev, error: null }));
  }, []);

  const handleLoadedData = useCallback(() => {
    setVideoState(prev => ({ 
      ...prev, 
      isLoaded: true,
      error: null 
    }));
  }, []);

  const handleError = useCallback((e) => {
    setVideoState(prev => ({ 
      ...prev, 
      error: 'Failed to load video',
      isLoaded: false 
    }));
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const progress = (video.currentTime / video.duration) * 100;
    
    setVideoState(prev => ({
      ...prev,
      progress: isNaN(progress) ? 0 : progress,
      duration: video.duration || 0,
    }));
  }, []);

  const handlePlay = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: true }));
  }, []);

  const handlePause = useCallback(() => {
    setVideoState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleVolumeChange = useCallback((volume) => {
    setVideoState(prev => ({ 
      ...prev, 
      volume: Math.max(0, Math.min(1, volume)),
      isMuted: volume === 0 
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    
    const newMuted = !videoState.isMuted;
    videoRef.current.muted = newMuted;
    
    setVideoState(prev => ({ 
      ...prev, 
      isMuted: newMuted,
      volume: newMuted ? 0 : prev.volume 
    }));
  }, [videoState.isMuted]);

  const seekTo = useCallback((progress) => {
    if (!videoRef.current) return;
    
    const time = (progress / 100) * videoState.duration;
    videoRef.current.currentTime = time;
    
    setVideoState(prev => ({ ...prev, progress }));
  }, [videoState.duration]);

  return {
    videoRef,
    progressRef,
    videoState,
    handleLoadStart,
    handleLoadedData,
    handleError,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleVolumeChange,
    toggleMute,
    seekTo,
  };
}

/**
 * Optimized Video Component
 */
export function OptimizedVideo({ 
  src, 
  poster, 
  title = "Video",
  className = "",
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  preload = "metadata",
  onError,
  onLoad,
  ...props 
}) {
  const {
    videoRef,
    videoState,
    handleLoadStart,
    handleLoadedData,
    handleError,
    handleTimeUpdate,
    handlePlay,
    handlePause,
    handleVolumeChange,
    toggleMute,
    seekTo,
  } = useOptimizedVideo();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadStart = () => handleLoadStart();
    const onLoadedData = () => {
      handleLoadedData();
      onLoad?.();
    };
    const onErrorEvent = (e) => {
      handleError(e);
      onError?.(e);
    };
    const onTimeUpdateEvent = () => handleTimeUpdate();
    const onPlayEvent = () => handlePlay();
    const onPauseEvent = () => handlePause();

    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('error', onErrorEvent);
    video.addEventListener('timeupdate', onTimeUpdateEvent);
    video.addEventListener('play', onPlayEvent);
    video.addEventListener('pause', onPauseEvent);

    return () => {
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('error', onErrorEvent);
      video.removeEventListener('timeupdate', onTimeUpdateEvent);
      video.removeEventListener('play', onPlayEvent);
      video.removeEventListener('pause', onPauseEvent);
    };
  }, [handleLoadStart, handleLoadedData, handleError, handleTimeUpdate, handlePlay, handlePause, onLoad, onError]);

  // Custom controls component
  const CustomControls = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
      {/* Progress bar */}
      <div className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer">
        <div 
          className="h-full bg-orange-500 rounded-full transition-all duration-150"
          style={{ width: `${videoState.progress}%` }}
          onClick={(e) => {
            const rect = e.currentTarget.parentElement.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progress = (clickX / rect.width) * 100;
            seekTo(progress);
          }}
        />
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={() => {
              if (!videoRef.current) return;
              if (videoState.isPlaying) {
                videoRef.current.pause();
              } else {
                videoRef.current.play();
              }
            }}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {videoState.isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            {videoState.isMuted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.781L4.172 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.172l4.211-2.781zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.781L4.172 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.172l4.211-2.781zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
        
        <div className="text-sm">
          {Math.floor(videoState.duration / 60)}:{String(Math.floor(videoState.duration % 60)).padStart(2, '0')}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`relative group ${className}`}>
      {/* Loading skeleton */}
      {!videoState.isLoaded && !videoState.error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-500">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Error state */}
      {videoState.error && (
        <div className="absolute inset-0 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
          <div className="text-center text-red-600">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Failed to load video</p>
          </div>
        </div>
      )}
      
      {/* Video element */}
      <video
        ref={videoRef}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          videoState.isLoaded ? 'opacity-100' : 'opacity-0'
        } ${controls ? 'bg-black' : ''}`}
        poster={poster}
        muted={muted}
        loop={loop}
        preload={preload}
        playsInline
        {...props}
      >
        <source src={src} type="video/mp4" />
        <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        <source src={src.replace('.mp4', '.ogg')} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
      
      {/* Custom controls (show when video is loaded) */}
      {controls && videoState.isLoaded && !videoState.error && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CustomControls />
        </div>
      )}
    </div>
  );
}

/**
 * Video thumbnail generator utility
 */
export function generateVideoThumbnail(videoUrl, time = 1) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    
    video.addEventListener('loadedmetadata', () => {
      video.currentTime = Math.min(time, video.duration);
    });
    
    video.addEventListener('seeked', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to generate thumbnail'));
        }
      }, 'image/jpeg', 0.8);
    });
    
    video.addEventListener('error', reject);
    video.src = videoUrl;
  });
}

/**
 * Video compression utility
 */
export function compressVideo(file, options = {}) {
  return new Promise((resolve, reject) => {
    const { 
      maxWidth = 1920, 
      maxHeight = 1080, 
      quality = 0.8,
      bitrate = 1000000 
    } = options;
    
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.addEventListener('loadedmetadata', () => {
      // Calculate new dimensions
      const { videoWidth, videoHeight } = video;
      let { width, height } = { width: videoWidth, height: videoHeight };
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
        videoBitsPerSecond: bitrate,
      });
      
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      mediaRecorder.start();
      
      const drawFrame = () => {
        ctx.drawImage(video, 0, 0, width, height);
        if (!video.ended) {
          requestAnimationFrame(drawFrame);
        }
      };
      
      video.addEventListener('play', drawFrame);
      video.currentTime = 0;
      video.play();
      
      // Stop recording after video ends
      video.addEventListener('ended', () => {
        mediaRecorder.stop();
      });
    });
    
    video.addEventListener('error', reject);
    video.src = URL.createObjectURL(file);
  });
}