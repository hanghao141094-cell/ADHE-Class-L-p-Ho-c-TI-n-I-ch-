/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Music4, Volume2, VolumeX, Film, Image as ImageIcon, Sparkles, Trophy } from 'lucide-react';
import { audioSynth } from './AudioSynthesizer';
import { useLMS } from '../context/LMSContext';

export const BannerSlider: React.FC = () => {
  const { settings } = useLMS();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const bannersList = settings?.banners || [];

  // Auto slide dynamically based on each banner's duration (default to 6s)
  useEffect(() => {
    if (bannersList.length <= 1) return;
    const currentSlide = bannersList[currentIdx];
    const slideDuration = (currentSlide?.duration || 5) * 1000;
    
    const timer = setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % bannersList.length);
    }, slideDuration);
    
    return () => clearTimeout(timer);
  }, [bannersList.length, currentIdx, bannersList]);

  // If active index gets out of bounds (e.g. after a deletion)
  useEffect(() => {
    if (currentIdx >= bannersList.length) {
      setCurrentIdx(0);
    }
  }, [bannersList, currentIdx]);

  const toggleMusic = () => {
    if (musicPlaying) {
      audioSynth.stopAmbient();
      setMusicPlaying(false);
    } else {
      audioSynth.playAmbient();
      setMusicPlaying(true);
    }
  };

  if (bannersList.length === 0) {
    return (
      <div className="relative w-full h-56 md:h-64 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r from-indigo-500 to-purple-600 p-6 md:p-8 text-white flex flex-col justify-between">
        <div className="text-center my-auto space-y-2">
          <Sparkles className="h-10 w-10 mx-auto animate-pulse text-amber-300" />
          <h2 className="text-lg md:text-xl font-bold">Bảng tin lớp học trống</h2>
          <p className="text-xs text-indigo-100 max-w-md mx-auto">Cô giáo có thể thêm tin giới thiệu hoạt động lớp học, hình ảnh, video trong phần "Cài đặt lớp học".</p>
        </div>
      </div>
    );
  }

  const currentSlide = bannersList[currentIdx] || bannersList[0];
  const defaultBg = currentSlide.bgClass || 'from-indigo-500 via-purple-500 to-pink-500';

  return (
    <div className="relative w-full min-h-[22rem] md:h-80 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r p-4 text-white flex flex-col justify-between transition-all duration-700">
      {/* Background Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-r ${defaultBg} opacity-95 transition-all duration-1000 -z-10`} />
      
      {/* Playful Vector Circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-xl -ml-16 -mb-16 pointer-events-none" />

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-stretch justify-between h-full gap-5 w-full flex-grow pb-2"
        >
          {/* Media box - takes left 3/4 area on desktop, full height and fully full bordered */}
          <div className="flex-1 md:w-[73%] h-48 md:h-[15.5rem] bg-slate-950 rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl relative group flex items-center justify-center shrink-0">
            {currentSlide.url ? (
              currentSlide.type === 'video' ? (
                <video
                  src={currentSlide.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={currentSlide.url}
                  alt={currentSlide.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-800 flex flex-col items-center justify-center p-4 text-center">
                <ImageIcon className="h-10 w-10 text-white/40 mb-2 animate-bounce" />
                <span className="text-xs text-white/50 font-bold">Hình ảnh/Video đang tải...</span>
              </div>
            )}
            
            {/* Tag overlay - no seconds count displayed as requested */}
            <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-[9px] font-black px-2.5 py-1 rounded-md text-white tracking-wider uppercase shadow-md flex items-center gap-1">
              {currentSlide.type === 'video' ? (
                <>
                  <Film className="h-3 w-3 text-amber-300 animate-pulse" />
                  <span>VIDEO PHÓNG SỰ 🎥</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3 w-3 text-amber-300" />
                  <span>ẢNH HOẠT ĐỘNG 📷</span>
                </>
              )}
            </div>
          </div>

          {/* Content panel - takes right 1/4 area on desktop, highly readable */}
          <div className="w-full md:w-[27%] flex flex-col justify-between h-auto md:h-[15.5rem] space-y-2.5 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 shadow-sm">
            <div className="space-y-1.5 overflow-hidden">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-amber-950 rounded-full text-[9px] font-black tracking-wide uppercase shadow-xs">
                <Sparkles className="h-2.5 w-2.5" />
                <span>BẢNG TIN LỚP</span>
              </span>
              <h2 className="text-sm md:text-base font-black tracking-tight drop-shadow-md text-yellow-100 line-clamp-2 uppercase">
                {currentSlide.title}
              </h2>
              <p className="text-[10px] md:text-xs text-white/95 font-semibold leading-relaxed bg-black/15 p-2 rounded-xl border border-white/5 overflow-y-auto max-h-[8rem] scrollbar-thin scrollbar-thumb-white/20">
                {currentSlide.description}
              </p>
            </div>

            {currentSlide.note && (
              <div className="text-[9px] text-amber-200 bg-black/25 px-2 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs font-black flex items-start space-x-1 shrink-0">
                <span className="shrink-0">📝</span>
                <span className="italic line-clamp-2">Ghi chú: {currentSlide.note}</span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls Footer */}
      <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-3 z-10">
        {/* Bullets indicator */}
        <div className="flex space-x-1.5">
          {bannersList.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIdx ? 'w-5 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Calm study music toggle */}
        <button
          onClick={toggleMusic}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 border backdrop-blur-md ${
            musicPlaying
              ? 'bg-emerald-500/80 hover:bg-emerald-600/85 border-emerald-400 text-white shadow-md animate-pulse'
              : 'bg-white/10 hover:bg-white/25 border-white/10 text-white'
          }`}
        >
          {musicPlaying ? (
            <>
              <Volume2 className="h-3.5 w-3.5 animate-bounce" />
              <span>Đang phát nhạc 🎵</span>
            </>
          ) : (
            <>
              <VolumeX className="h-3.5 w-3.5" />
              <span>Bật nhạc lớp học 🔇</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
