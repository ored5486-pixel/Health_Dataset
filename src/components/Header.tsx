import React from 'react';
import { Activity, Calendar, User, RefreshCw, Database, Sparkles, ExternalLink } from 'lucide-react';
import { SheetFetchResult } from '../services/sheetService';

interface HeaderProps {
  sheetStatus: SheetFetchResult | null;
  onRefresh: () => void;
  onOpenSyncModal: () => void;
  isSyncing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  sheetStatus,
  onRefresh,
  onOpenSyncModal,
  isSyncing,
}) => {
  return (
    <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 p-6 md:p-8 text-white shadow-xl shadow-pink-500/20 mb-8 border border-white/20">
      {/* Decorative background blurs and circles */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-pink-400/20 blur-xl pointer-events-none" />
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Title and descriptions */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-medium text-pink-50 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
            <span>ระบบสารสนเทศสุขภาพชุมชน • Health Intelligence Dashboard</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30 text-white">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                รายงานการคัดกรองสุขภาพ
              </h1>
              <p className="text-pink-100 text-sm sm:text-base font-normal mt-0.5">
                ผลรายงานการคัดกรองสุขภาพของบุคคลแต่ละพื้นที่
              </p>
            </div>
          </div>

          {/* Metadata chips: Creator & Update timestamp */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-xs sm:text-sm text-pink-100">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              <User className="w-4 h-4 text-pink-200" />
              <span>ผู้จัดทำ: <strong className="text-white font-semibold">นางสาวณัฐธิดา อินทร</strong></span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20">
              <Calendar className="w-4 h-4 text-pink-200" />
              <span>อัปเดตข้อมูลล่าสุด: <strong className="text-white font-semibold">{sheetStatus?.updatedAt || 'กำลังโหลด...'}</strong></span>
            </div>
          </div>
        </div>

        {/* Right side: Google Sheet sync info & controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/20 hover:bg-white/30 transition backdrop-blur-md border border-white/30 text-xs sm:text-sm font-medium text-white shadow-sm text-left group"
            title="คลิกเพื่อจัดการการเชื่อมต่อ Google Sheets"
          >
            <Database className="w-4 h-4 text-pink-200 group-hover:scale-110 transition-transform" />
            <div>
              <div className="text-[11px] text-pink-200 leading-tight">Google Sheet ID</div>
              <div className="font-mono text-xs text-white max-w-[170px] truncate">
                {sheetStatus?.sheetId || '1bqsihfCpoq...'}
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-pink-200 opacity-70 group-hover:opacity-100" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white text-pink-600 hover:bg-pink-50 active:scale-95 transition font-semibold text-xs sm:text-sm shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์ข้อมูล...' : 'ซิงค์ข้อมูลใหม่'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
