/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  PieChart, Activity, FileSpreadsheet, ShieldAlert, Heart,
  Sparkles, CheckCircle, CheckCircle2, Info, AlertTriangle,
  ExternalLink, Upload, RefreshCw
} from 'lucide-react';
import { HealthRecord, FilterState, TabType } from './types';
import { fetchHealthRecordsFromSheet, SheetFetchResult, TARGET_SHEET_ID } from './services/sheetService';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KPICards } from './components/KPICards';
import { RiskOverviewTab } from './components/RiskOverviewTab';
import { BehaviorTrendTab } from './components/BehaviorTrendTab';
import { DetailTableTab } from './components/DetailTableTab';
import { SheetSyncModal } from './components/SheetSyncModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('tab1_overview');
  const [currentSheetId, setCurrentSheetId] = useState<string>(TARGET_SHEET_ID);
  const [healthData, setHealthData] = useState<HealthRecord[]>([]);
  const [sheetStatus, setSheetStatus] = useState<SheetFetchResult | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    area: 'ทั้งหมด',
    ageGroup: 'ทั้งหมด',
    gender: 'ทั้งหมด',
    riskLevel: 'ทั้งหมด',
    searchQuery: '',
  });

  // Load data from Google Sheet / Default dataset
  const loadData = useCallback(async (sheetId: string = currentSheetId) => {
    setIsSyncing(true);
    try {
      const result = await fetchHealthRecordsFromSheet(sheetId);
      setHealthData(result.records);
      setSheetStatus(result);
    } catch (err) {
      console.error('Failed to load health records', err);
    } finally {
      setIsSyncing(false);
    }
  }, [currentSheetId]);

  useEffect(() => {
    loadData(currentSheetId);
  }, [loadData, currentSheetId]);

  // Distinct areas for filter
  const areaOptions = useMemo(() => {
    return Array.from(new Set(healthData.map((d) => d.area))).sort();
  }, [healthData]);

  // Filtered dataset according to active filters
  const filteredData = useMemo(() => {
    return healthData.filter((item) => {
      // 1. Area filter
      if (filters.area !== 'ทั้งหมด' && item.area !== filters.area) {
        return false;
      }

      // 2. Age group filter
      if (filters.ageGroup !== 'ทั้งหมด') {
        if (filters.ageGroup === 'น้อยกว่า 35 ปี' && item.age >= 35) return false;
        if (filters.ageGroup === '35-49 ปี' && (item.age < 35 || item.age > 49)) return false;
        if (filters.ageGroup === '50-59 ปี' && (item.age < 50 || item.age > 59)) return false;
        if (filters.ageGroup === '60 ปีขึ้นไป' && item.age < 60) return false;
      }

      // 3. Gender filter
      if (filters.gender !== 'ทั้งหมด' && item.gender !== filters.gender) {
        return false;
      }

      // 4. Risk level filter
      if (filters.riskLevel !== 'ทั้งหมด') {
        const isHigh = filters.riskLevel.includes('สูง');
        const isMed = filters.riskLevel.includes('กลาง');
        const isLow = filters.riskLevel.includes('ต่ำ');
        if (isHigh && !item.riskLevel.includes('สูง')) return false;
        if (isMed && !item.riskLevel.includes('กลาง')) return false;
        if (isLow && !item.riskLevel.includes('ต่ำ')) return false;
      }

      // 5. Search query
      if (filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchId = item.id.toLowerCase().includes(q);
        const matchArea = item.area.toLowerCase().includes(q);
        if (!matchId && !matchArea) return false;
      }

      return true;
    });
  }, [healthData, filters]);

  // Custom data import from file/text
  const handleImportCustomRecords = (newRecords: HealthRecord[], sourceLabel: string) => {
    const now = new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date());

    try {
      localStorage.setItem('user_imported_health_records', JSON.stringify({
        records: newRecords,
        updatedAt: now,
        sourceLabel,
      }));
    } catch {}

    setHealthData(newRecords);
    setSheetStatus({
      records: newRecords,
      source: 'manual_csv',
      updatedAt: now,
      sheetId: currentSheetId,
      statusMessage: `นำเข้าข้อมูลจาก ${sourceLabel} สำเร็จ (${newRecords.length} รายการ)`,
      isRestricted: false,
    });
  };

  const handleUpdateSheetId = (newId: string) => {
    setCurrentSheetId(newId);
    loadData(newId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-fuchsia-50/50 pb-16">
      {/* Top Banner Accent */}
      <div className="h-1.5 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-600 w-full" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* 1. ส่วนหัวและระบบควบคุม (Header) */}
        <Header
          sheetStatus={sheetStatus}
          onRefresh={() => loadData(currentSheetId)}
          onOpenSyncModal={() => setIsSyncModalOpen(true)}
          isSyncing={isSyncing}
        />

        {/* Banner แจ้งเตือนและแนะนำการเชื่อมโยง Google Sheet ข้อมูลจริง */}
        {sheetStatus?.isRestricted && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-pink-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600 shrink-0 mt-0.5 shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-800 text-sm">
                    สถานะการเชื่อมต่อ Google Sheet ID: <span className="font-mono text-pink-700 bg-pink-100/70 px-2 py-0.5 rounded-lg text-xs">{currentSheetId}</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    รอเปิดสิทธิ์การแชร์ (Restricted)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  เนื่องจาก Google Sheets ปิดกั้นการอ่านข้อมูลจากภายนอก หากต้องการให้แดชบอร์ด<strong>ดึงข้อมูลจริงจากชีตของท่านโดยตรง</strong> ให้ทำตามขั้นตอน:
                </p>
                <div className="text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl border border-pink-100 space-y-1 font-medium">
                  <div>1. คลิกเปิดชีต &rarr; กดปุ่ม <strong>"แชร์ (Share)"</strong> สีฟ้ามุมขวาบน</div>
                  <div>2. ตรง <strong>"การเข้าถึงทั่วไป (General access)"</strong> เปลี่ยนเป็น <strong>"ทุกคนที่มีลิงก์ (Anyone with the link)"</strong> สิทธิ์ผู้มีสิทธิ์อ่าน</div>
                  <div>3. กลับมากดปุ่ม <strong>"ซิงค์ข้อมูลสดจาก Sheet"</strong> ระบบจะประมวลผลข้อมูลจริงทั้งหมดทันที!</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap md:flex-col gap-2 shrink-0 md:w-56">
              <a
                href={`https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition shadow-sm text-center"
              >
                <span>เปิด Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => loadData(currentSheetId)}
                disabled={isSyncing}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-pink-50 border border-pink-300 text-pink-700 font-semibold text-xs transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'กำลังลองซิงค์...' : 'ซิงค์ข้อมูลสดจาก Sheet'}</span>
              </button>

              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs transition"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>วาง/อัปโหลด CSV</span>
              </button>
            </div>
          </div>
        )}

        {/* Banner เมื่อดึงข้อมูลสดจาก Google Sheet ได้สำเร็จ */}
        {sheetStatus && !sheetStatus.isRestricted && sheetStatus.source === 'google_sheets_live' && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong className="font-bold">เชื่อมต่อข้อมูลสดสำเร็จ 100%:</strong> กำลังใช้ข้อมูลจริงจาก Google Sheet ID: <span className="font-mono">{currentSheetId}</span> ({healthData.length} รายการ)
              </div>
            </div>
            <button
              onClick={() => loadData(currentSheetId)}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] shrink-0 transition"
            >
              {isSyncing ? 'กำลังซิงค์...' : 'รีเฟรชข้อมูลล่าสุด'}
            </button>
          </div>
        )}

        {/* Banner เมื่อใช้ข้อมูลจากไฟล์ CSV ที่นำเข้า */}
        {sheetStatus && sheetStatus.source === 'manual_csv' && (
          <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-900 shadow-sm flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-fuchsia-600 shrink-0" />
              <div>
                <strong className="font-bold">ใช้ข้อมูลจากไฟล์ชีตที่นำเข้า:</strong> {sheetStatus.statusMessage}
              </div>
            </div>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-medium text-[11px] shrink-0 transition"
            >
              จัดการไฟล์ข้อมูล
            </button>
          </div>
        )}

        {/* 1. ส่วนควบคุมตัวกรอง (Filters) */}
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          areaOptions={areaOptions}
          totalRecords={healthData.length}
          filteredRecordsCount={filteredData.length}
        />

        {/* 2. การสรุปข้อมูลสำคัญ (KPI Cards / Summary Cards) */}
        <KPICards data={filteredData} />

        {/* 5. ระบบนำทาง Navigation Controls Bar / Tab สลับ 3 หน้า */}
        <nav className="mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-pink-100 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {/* Tab 1 : ภาพรวมความเสี่ยงและพื้นที่ */}
              <button
                id="tab-1-button"
                onClick={() => setActiveTab('tab1_overview')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === 'tab1_overview'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                }`}
              >
                <PieChart className="w-4 h-4" />
                <span>Tab 1 : ภาพรวมความเสี่ยงและพื้นที่</span>
              </button>

              {/* Tab 2 : พฤติกรรมและแนวโน้มสุขภาพ */}
              <button
                id="tab-2-button"
                onClick={() => setActiveTab('tab2_behavior')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === 'tab2_behavior'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Tab 2 : พฤติกรรมและแนวโน้มสุขภาพ</span>
              </button>

              {/* Tab 3 : ตารางข้อมูลเชิงลึกรายบุคคล */}
              <button
                id="tab-3-button"
                onClick={() => setActiveTab('tab3_detail')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === 'tab3_detail'
                    ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow-md shadow-pink-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/60'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Tab 3 : ตารางข้อมูลเชิงลึกรายบุคคล</span>
              </button>
            </div>

            {/* Tab summary badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 text-xs font-semibold border border-pink-200/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {activeTab === 'tab1_overview' && 'วิเคราะห์คะแนน, สัดส่วนความเสี่ยง, เบาหวาน และความดันโลหิต'}
                {activeTab === 'tab2_behavior' && 'วิเคราะห์การสูบบุหรี่, แอลกอฮอล์, ออกกำลังกาย, BMI vs น้ำตาล/ความดัน'}
                {activeTab === 'tab3_detail' && 'ตารางข้อมูลรายบุคคลพร้อมระบบ Conditional Formatting'}
              </span>
            </div>
          </div>
        </nav>

        {/* Tab Contents */}
        <section className="transition-all duration-300">
          {activeTab === 'tab1_overview' && <RiskOverviewTab data={filteredData} />}
          {activeTab === 'tab2_behavior' && <BehaviorTrendTab data={filteredData} />}
          {activeTab === 'tab3_detail' && <DetailTableTab data={filteredData} />}
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-pink-200/60 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>
              รายงานการคัดกรองสุขภาพ • จัดทำโดย <strong>นางสาวณัฐธิดา อินทร</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>เชื่อมโยงข้อมูล Google Sheet ID: {currentSheetId}</span>
            <span>•</span>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="text-pink-600 hover:underline font-medium"
            >
              จัดการการเชื่อมต่อ
            </button>
          </div>
        </footer>
      </main>

      {/* Google Sheet Sync & Import Modal */}
      <SheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentSheetId={currentSheetId}
        sheetStatus={sheetStatus}
        onUpdateSheetId={handleUpdateSheetId}
        onImportCustomRecords={handleImportCustomRecords}
        isSyncing={isSyncing}
      />
    </div>
  );
}
