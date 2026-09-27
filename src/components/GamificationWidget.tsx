import React from 'react';
import { Award, Zap, Trophy, Star, CheckCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const GamificationWidget: React.FC = () => {
  const badges = [
    {
      id: 'streak-15',
      name: 'Chiến Binh Kim Cương',
      desc: 'Đi học đúng giờ 15 ca liên tiếp',
      icon: '💎',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      unlockedCount: 88
    },
    {
      id: 'punctual-master',
      name: 'Thần Tốc Đúng Giờ',
      desc: 'Quét mã QR trong 180s đầu tiên',
      icon: '⚡',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      unlockedCount: 142
    },
    {
      id: 'zero-unexcused',
      name: 'Kỷ Luật Thép',
      desc: '0 lần vắng không phép toàn kỳ',
      icon: '🛡️',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      unlockedCount: 205
    },
    {
      id: 'comeback-hero',
      name: 'Bứt Phá Chuyên Cần',
      desc: 'Kéo tỷ lệ vắng từ 18% xuống < 8%',
      icon: '🚀',
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      unlockedCount: 12
    }
  ];

  const topClasses = [
    { rank: 1, name: 'CNTT-K22A', score: '98.5%', badge: '🥇 Vàng' },
    { rank: 2, name: 'TKĐH-K22', score: '96.2%', badge: '🥈 Bạc' },
    { rank: 3, name: 'CĐT-K22B', score: '94.8%', badge: '🥉 Đồng' }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Gamification Chuyên Cần & Vinh Danh (Streak Rewards)
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Khen Thưởng Học Đường
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Động viên người học bằng huy hiệu số và chuỗi chuyên cần tích cực
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Badges Matrix */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
            Huy Hiệu Chuyên Cần Tiêu Biểu
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            {badges.map(b => (
              <div key={b.id} className={`p-3 rounded-xl border ${b.color} transition-transform hover:scale-102 shadow-2xs`}>
                <div className="text-xl mb-1">{b.icon}</div>
                <div className="font-bold text-xs">{b.name}</div>
                <div className="text-2xs opacity-80 mt-0.5 line-clamp-1">{b.desc}</div>
                <div className="mt-2 text-2xs font-semibold font-mono">
                  {b.unlockedCount} sinh viên đạt
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Class Leaderboard */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2.5">
            Bảng Xếp Hạng Lớp Chuyên Cần Xuất Sắc
          </span>
          <div className="space-y-2">
            {topClasses.map(c => (
              <div key={c.rank} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm">{c.badge}</span>
                  <div>
                    <strong className="text-slate-900">{c.name}</strong>
                    <div className="text-2xs text-slate-500">Toàn khóa 2026-2027</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-emerald-700">{c.score}</span>
                  <div className="text-2xs text-slate-400">Tỷ lệ đúng giờ</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
