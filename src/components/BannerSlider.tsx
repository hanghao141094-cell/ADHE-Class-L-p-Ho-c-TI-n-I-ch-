/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Music4, Volume2, VolumeX, Sparkles, Trophy } from 'lucide-react';
import { audioSynth } from './AudioSynthesizer';

interface Slide {
  id: number;
  bgClass: string;
  title: string;
  subtitle: string;
  icon: string;
  accentText: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    bgClass: 'from-amber-400 via-pink-400 to-rose-400',
    title: 'Chào mừng bé đến với Lớp Học Vui Vẻ! 🎉',
    subtitle: 'Nơi mỗi ngày đến trường là một ngày ngập tràn niềm vui, sáng tạo và những bài học bổ ích mới lạ!',
    icon: '🏫',
    accentText: 'Chào mừng năm học mới!'
  },
  {
    id: 2,
    bgClass: 'from-cyan-400 via-teal-400 to-emerald-400',
    title: 'Tích Sao Lấp Lánh - Đổi Thưởng To! ⭐',
    subtitle: 'Mỗi bài phát biểu, việc làm tốt hay bài tập hoàn thành xuất sắc sẽ mang lại cho bé những ngôi sao vinh danh rực rỡ.',
    icon: '✨',
    accentText: '50 Sao = 1 Cờ Thi Đua!'
  },
  {
    id: 3,
    bgClass: 'from-purple-500 via-indigo-400 to-blue-400',
    title: 'Ba Mẹ Và Thầy Cô Luôn Đồng Hành 💖',
    subtitle: 'Gia đình và nhà trường kết nối tức thì, cập nhật điểm danh, bài học và gửi gắm những lời động viên ngọt ngào nhất.',
    icon: '🏡',
    accentText: 'Kết nối thời gian thực!'
  }
];

export const BannerSlider: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const toggleMusic = () => {
    if (musicPlaying) {
      audioSynth.stopAmbient();
      setMusicPlaying(false);
    } else {
      audioSynth.playAmbient();
      setMusicPlaying(true);
    }
  };

  const currentSlide = SLIDES[currentIdx];

  return (
    <div className="relative w-full h-56 md:h-64 rounded-3xl overflow-hidden shadow-xl bg-gradient-to-r p-6 md:p-8 text-white flex flex-col justify-between transition-all duration-700">
      {/* Background Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.bgClass} opacity-95 transition-all duration-1000 -z-10`} />
      
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
          className="flex flex-col md:flex-row items-center justify-between h-full gap-4 md:gap-8"
        >
          <div className="flex-1 space-y-2 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide border border-white/10 uppercase">
              {currentSlide.accentText}
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight drop-shadow-md">
              {currentSlide.title}
            </h2>
            <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed max-w-2xl">
              {currentSlide.subtitle}
            </p>
          </div>
          
          <div className="hidden md:flex items-center justify-center w-28 h-28 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner text-5xl">
            {currentSlide.icon}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls Footer */}
      <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4 z-10">
        {/* Bullets indicator */}
        <div className="flex space-x-2">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIdx(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIdx ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Calm study music toggle */}
        <button
          onClick={toggleMusic}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-medium transition-all duration-300 border backdrop-blur-md ${
            musicPlaying
              ? 'bg-emerald-500/80 hover:bg-emerald-600/85 border-emerald-400 text-white shadow-md animate-pulse'
              : 'bg-white/10 hover:bg-white/25 border-white/10 text-white'
          }`}
        >
          {musicPlaying ? (
            <>
              <Volume2 className="h-4.5 w-4.5 animate-bounce" />
              <span>Đang phát nhạc lớp học 🎵</span>
            </>
          ) : (
            <>
              <VolumeX className="h-4.5 w-4.5" />
              <span>Bật nhạc lớp học 🔇</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
