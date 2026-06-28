/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ExternalLink, Plus, Trash2, Globe, Sparkles, AlertCircle } from 'lucide-react';
import { useLMS } from '../context/LMSContext';
import { audioSynth } from './AudioSynthesizer';

interface LinkItem {
  id: string;
  name: string;
  desc: string;
  url: string;
  emoji: string;
  colorClass: string; // Tailwind class name or custom classes
}

const INITIAL_LINKS: LinkItem[] = [
  {
    id: "link_1",
    name: "VioEdu Toán Học",
    desc: "Nền tảng tự học thông minh và tranh tài Toán học",
    url: "https://vio.edu.vn",
    emoji: "🎓",
    colorClass: "bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-200 hover:border-amber-400"
  },
  {
    id: "link_2",
    name: "Học liệu OLM.vn",
    desc: "Trang ôn luyện & học tập đầy đủ môn học tiểu học",
    url: "https://olm.vn",
    emoji: "📖",
    colorClass: "bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border-emerald-200 hover:border-emerald-400"
  },
  {
    id: "link_3",
    name: "Hoc247 Kids",
    desc: "Phần mềm học toán tư duy, tiếng anh vui nhộn",
    url: "https://kids.hoc247.vn",
    emoji: "🎮",
    colorClass: "bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border-indigo-200 hover:border-indigo-400"
  },
  {
    id: "link_4",
    name: "YouTube Kids",
    desc: "Không gian video bổ ích giải trí an toàn cho bé",
    url: "https://www.youtubekids.com",
    emoji: "🎥",
    colorClass: "bg-rose-50 hover:bg-rose-100/80 text-rose-900 border-rose-200 hover:border-rose-400"
  },
  {
    id: "link_5",
    name: "Trạng Nguyên Tiếng Việt",
    desc: "Sân chơi thi Tiếng Việt online rèn luyện tư duy",
    url: "https://trangnguyen.edu.vn",
    emoji: "🌐",
    colorClass: "bg-sky-50 hover:bg-sky-100/80 text-sky-900 border-sky-200 hover:border-sky-400"
  },
  {
    id: "link_6",
    name: "Hành Trang Số (NXBGD)",
    desc: "Xem trực tuyến sách giáo khoa điện tử tiểu học",
    url: "https://hanhtrangso.nxbgd.vn",
    emoji: "✨",
    colorClass: "bg-violet-50 hover:bg-violet-100/80 text-violet-900 border-violet-200 hover:border-violet-400"
  }
];

const PRESET_COLORS = [
  { name: 'Cam vàng 🍯', value: 'bg-amber-50 hover:bg-amber-100/80 text-amber-900 border-amber-200 hover:border-amber-400' },
  { name: 'Xanh lục 🌱', value: 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border-emerald-200 hover:border-emerald-400' },
  { name: 'Xanh dương 💧', value: 'bg-sky-50 hover:bg-sky-100/80 text-sky-900 border-sky-200 hover:border-sky-400' },
  { name: 'Hồng sen 🌸', value: 'bg-rose-50 hover:bg-rose-100/80 text-rose-900 border-rose-200 hover:border-rose-400' },
  { name: 'Tím hoa cà 🦄', value: 'bg-violet-50 hover:bg-violet-100/80 text-violet-900 border-violet-200 hover:border-violet-400' },
  { name: 'Xanh chàm 🌌', value: 'bg-indigo-50 hover:bg-indigo-100/80 text-indigo-900 border-indigo-200 hover:border-indigo-400' }
];

export const EducationalLinks: React.FC = () => {
  const { currentUser } = useLMS();
  const isTeacher = currentUser?.role === 'teacher';

  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('lms_educational_links');
    return saved ? JSON.parse(saved) : INITIAL_LINKS;
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkDesc, setNewLinkDesc] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkEmoji, setNewLinkEmoji] = useState('🌐');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Sync to local storage
  const saveLinks = (updatedLinks: LinkItem[]) => {
    setLinks(updatedLinks);
    localStorage.setItem('lms_educational_links', JSON.stringify(updatedLinks));
  };

  // Keep synced across component updates or local storage events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'lms_educational_links' && e.newValue) {
        setLinks(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLinkClick = (url: string) => {
    audioSynth.playBubblePop();
    setTimeout(() => {
      window.open(url, '_blank');
    }, 150);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkName.trim() || !newLinkUrl.trim()) return;

    // Standardize URL
    let formattedUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newLink: LinkItem = {
      id: `link_${Date.now()}`,
      name: newLinkName.trim(),
      desc: newLinkDesc.trim() || 'Học liệu điện tử chất lượng cao',
      url: formattedUrl,
      emoji: newLinkEmoji,
      colorClass: PRESET_COLORS[selectedColorIndex].value
    };

    const updated = [...links, newLink];
    saveLinks(updated);
    
    // Reset form
    setNewLinkName('');
    setNewLinkDesc('');
    setNewLinkUrl('');
    setNewLinkEmoji('🌐');
    setIsFormOpen(false);

    audioSynth.playBubblePop();
    alert('Đã thêm liên kết trang mạng mới thành công! ✨');
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop opening the link when clicking delete
    if (confirm('Bạn có chắc chắn muốn xóa liên kết này? Học sinh và phụ huynh sẽ không thấy liên kết này nữa.')) {
      const updated = links.filter(link => link.id !== id);
      saveLinks(updated);
      audioSynth.playBubblePop();
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100/50 border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="p-2 bg-amber-200/80 rounded-xl text-amber-800 text-xl">🌐</span>
          <h3 className="text-base font-black text-amber-950">
            <span>Liên Kết Ứng Dụng & Trang Học Tập Điện Tử</span>
          </h3>
          <button
            onClick={() => {
              audioSynth.playBubblePop();
              setIsCollapsed(!isCollapsed);
            }}
            className="p-1 px-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg text-xs font-black cursor-pointer transition flex items-center space-x-1"
            title={isCollapsed ? "Mở rộng liên kết" : "Thu gọn liên kết"}
          >
            <span>{isCollapsed ? "v" : "▲"}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {isTeacher && !isCollapsed && (
            <button
              onClick={() => {
                audioSynth.playBubblePop();
                setIsFormOpen(!isFormOpen);
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition cursor-pointer ${
                isFormOpen
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
              }`}
            >
              <Plus className="h-3 w-3" />
              <span>{isFormOpen ? 'Đóng bảng thêm ❌' : 'Thêm Trang Mạng ➕'}</span>
            </button>
          )}
          <span className="text-[10px] bg-indigo-500 text-white font-black px-2.5 py-1 rounded-full uppercase shadow-xs">
            🔊 Bấm Có Âm Thanh!
          </span>
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          <p className="text-[11px] text-amber-900/95 font-bold leading-relaxed">
            Các bé, phụ huynh và thầy cô nhấp vào logo liên kết để truy cập học liệu và giải trí bổ ích, có âm thanh tương tác sinh động! {isTeacher && 'Thầy cô có thể chủ động Thêm hoặc Xoá bớt các trang mạng để tuỳ biến tài nguyên cho lớp học.'}
          </p>

          {/* Teacher's Add Link Form */}
          {isTeacher && isFormOpen && (
            <form onSubmit={handleAddLink} className="bg-white border-2 border-amber-200 rounded-2xl p-4.5 space-y-3 shadow-inner animate-fadeIn">
              <span className="block text-xs font-black text-amber-900 uppercase">➕ THÊM TRANG MẠNG / ỨNG DỤNG MỚI</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tên Ứng Dụng / Trang Mạng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: VioEdu Toán Học, OLM, v.v..."
                    value={newLinkName}
                    onChange={e => setNewLinkName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border-2 border-slate-100 focus:border-amber-400 focus:outline-none bg-slate-50/50 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Đường dẫn liên kết (URL) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: vio.edu.vn"
                    value={newLinkUrl}
                    onChange={e => setNewLinkUrl(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border-2 border-slate-100 focus:border-amber-400 focus:outline-none bg-slate-50/50 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Mô tả ngắn trang mạng</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trang ôn luyện học tập bổ ích cho bé tiểu học..."
                  value={newLinkDesc}
                  onChange={e => setNewLinkDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border-2 border-slate-100 focus:border-amber-400 focus:outline-none bg-slate-50/50 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Chọn Nhãn Dán Emoji đặc trưng</label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                    {['🌐', '📚', '🧮', '📖', '🎮', '🎥', '✨', '🎓', '🧪', '🎨', '🎵', '🏫', '🦄', '⭐'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewLinkEmoji(emoji)}
                        className={`text-xl p-1.5 rounded-lg hover:bg-amber-100 transition ${
                          newLinkEmoji === emoji ? 'bg-amber-200 scale-110 border border-amber-300' : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Chọn Màu Sắc Khung</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESET_COLORS.map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColorIndex(idx)}
                        className={`text-[9px] font-bold p-2 border-2 rounded-xl transition text-left truncate ${
                          selectedColorIndex === idx ? 'border-amber-500 bg-amber-100/50 scale-[1.02]' : 'border-slate-100 bg-white'
                        }`}
                      >
                        {col.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black text-[10px] rounded-xl uppercase transition"
                >
                  Hủy bỏ ✕
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] rounded-xl uppercase tracking-wider transition shadow-sm"
                >
                  Lưu & Thêm mới ✅
                </button>
              </div>
            </form>
          )}

          {/* Grid of dynamic links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.url)}
                className={`flex items-center text-left p-3.5 rounded-2xl border-2 ${link.colorClass} transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer group relative`}
              >
                {/* Left Emoji Badge */}
                <div className="p-2 bg-white rounded-xl shadow-xs shrink-0 mr-3 text-2xl group-hover:scale-110 transition duration-300 select-none">
                  {link.emoji}
                </div>

                {/* Link Description */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-xs font-black truncate">{link.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate font-bold mt-0.5 leading-tight">{link.desc}</p>
                </div>

                {/* External Icon or Delete button */}
                <div className="absolute right-3.5 top-3.5 flex items-center space-x-1.5 z-10">
                  {isTeacher ? (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteLink(link.id, e)}
                      className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-600 hover:text-rose-800 border border-rose-200 rounded-lg transition duration-200 cursor-pointer shadow-xs"
                      title="Xoá liên kết này khỏi bảng của cả lớp"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  ) : (
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition shrink-0" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
