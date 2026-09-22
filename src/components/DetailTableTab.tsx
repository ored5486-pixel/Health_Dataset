import React, { useState, useMemo } from 'react';
import {
  Download, ArrowUpDown, ChevronLeft, ChevronRight, Eye,
  Search, ShieldAlert, CheckCircle2, AlertTriangle, FileSpreadsheet
} from 'lucide-react';
import { HealthRecord, RiskLevel } from '../types';
import { PersonDetailModal } from './PersonDetailModal';

interface DetailTableTabProps {
  data: HealthRecord[];
}

type SortField = 'id' | 'area' | 'gender' | 'age' | 'bmi' | 'sbp' | 'glucose' | 'exercise' | 'riskScore' | 'riskLevel';
type SortOrder = 'asc' | 'desc';

export const DetailTableTab: React.FC<DetailTableTabProps> = ({ data }) => {
  const [tableSearch, setTableSearch] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ทั้งหมด');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedPerson, setSelectedPerson] = useState<HealthRecord | null>(null);

  // Filter & Search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchSearch =
        tableSearch.trim() === '' ||
        item.id.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.area.toLowerCase().includes(tableSearch.toLowerCase()) ||
        item.gender.includes(tableSearch);

      let matchRisk = true;
      if (selectedRiskFilter !== 'ทั้งหมด') {
        const isHigh = selectedRiskFilter.includes('สูง');
        const isMed = selectedRiskFilter.includes('กลาง');
        const isLow = selectedRiskFilter.includes('ต่ำ');
        if (isHigh && !item.riskLevel.includes('สูง')) matchRisk = false;
        if (isMed && !item.riskLevel.includes('กลาง')) matchRisk = false;
        if (isLow && !item.riskLevel.includes('ต่ำ')) matchRisk = false;
      }

      return matchSearch && matchRisk;
    });
  }, [data, tableSearch, selectedRiskFilter]);

  // Sorting
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string, 'th')
          : (bVal as string).localeCompare(aVal as string, 'th');
      }

      return sortOrder === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [filteredData, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'รหัสบุคคล', 'วันที่คัดกรอง', 'พื้นที่', 'เพศ', 'อายุ', 'ส่วนสูง_cm', 'น้ำหนัก_kg',
      'BMI', 'SBP_mmHg', 'DBP_mmHg', 'ชีพจร_bpm', 'น้ำตาล_mg_dL', 'สูบบุหรี่',
      'ดื่มแอลกอฮอล์', 'การออกกำลังกาย', 'เบาหวาน_คัดกรอง', 'ความดันโลหิตสูง_คัดกรอง',
      'คะแนนความเสี่ยง', 'ระดับความเสี่ยง', 'เดือน'
    ];
    const rows = sortedData.map((d) => [
      d.id, d.checkDate, d.area, d.gender, d.age, d.height || '', d.weight || '',
      d.bmi, d.sbp, d.dbp || '', d.pulse, d.glucose,
      d.smoking, d.alcohol, d.exercise, d.diabetesScreening, d.hypertensionScreening,
      d.riskScore, d.riskLevel, d.month || ''
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายงานการคัดกรองสุขภาพ_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper for conditional formatting
  const getRiskLevelBadge = (level: RiskLevel) => {
    if (level.includes('สูง')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
          <ShieldAlert className="w-3 h-3 text-rose-600" />
          {level}
        </span>
      );
    }
    if (level.includes('กลาง')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {level}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        {level}
      </span>
    );
  };

  const getSBPStyle = (sbp: number) => {
    if (sbp >= 140) {
      return 'bg-rose-100/90 text-rose-900 font-extrabold border border-rose-300';
    }
    if (sbp >= 120) {
      return 'bg-amber-100/80 text-amber-900 font-bold border border-amber-200';
    }
    return 'bg-emerald-50 text-emerald-800 font-medium border border-emerald-100';
  };

  const getGlucoseStyle = (glucose: number) => {
    if (glucose >= 126) {
      return 'bg-rose-100/90 text-rose-900 font-extrabold border border-rose-300';
    }
    if (glucose >= 100) {
      return 'bg-amber-100/80 text-amber-900 font-bold border border-amber-200';
    }
    return 'bg-emerald-50 text-emerald-800 font-medium border border-emerald-100';
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-pink-50">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-bold text-slate-800">
                ตารางแสดงรายละเอียดรายบุคคล (Data Table / Detail View)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงข้อมูลรายบุคคล พร้อมระบบ <strong>Conditional Formatting</strong> เน้นสีแดงกลุ่มเสี่ยงสูง/เกินเกณฑ์, สีเหลืองปานกลาง, สีเขียวเสี่ยงต่ำ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 shadow-xs transition"
            >
              <Download className="w-4 h-4" />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* Legend / Color guide */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100 mb-4 text-xs">
          <span className="font-semibold text-slate-700">เกณฑ์การเน้นสี (Conditional Formatting):</span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
            🔴 สีแดง: เสี่ยงสูง / SBP &ge; 140 / น้ำตาล &ge; 126
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-200">
            🟡 สีเหลือง: เสี่ยงปานกลาง / SBP 120-139 / น้ำตาล 100-125
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
            🟢 สีเขียว: เสี่ยงต่ำ / SBP &lt; 120 / น้ำตาล &lt; 100
          </span>
        </div>

        {/* Filters row inside table */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="ค้นหาในตาราง (รหัส, พื้นที่, เพศ)..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium bg-white border border-pink-200 rounded-xl pl-8 pr-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-medium">กรองความเสี่ยง:</span>
            {['ทั้งหมด', 'เสี่ยงสูง', 'เสี่ยงปานกลาง', 'เสี่ยงต่ำ'].map((risk) => (
              <button
                key={risk}
                onClick={() => {
                  setSelectedRiskFilter(risk);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  selectedRiskFilter === risk
                    ? 'bg-pink-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-pink-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-pink-50/80 border-b border-pink-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3.5 px-4 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>รหัสบุคคล</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('area')}
                  className="py-3.5 px-4 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>พื้นที่</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gender')}
                  className="py-3.5 px-3 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>เพศ</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('age')}
                  className="py-3.5 px-3 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>อายุ</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('bmi')}
                  className="py-3.5 px-3 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>BMI</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sbp')}
                  className="py-3.5 px-3 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>SBP (ความดัน)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('glucose')}
                  className="py-3.5 px-3 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>น้ำตาล (mg/dL)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-4">การออกกำลังกาย</th>
                <th
                  onClick={() => handleSort('riskScore')}
                  className="py-3.5 px-3 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>คะแนนเสี่ยง</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('riskLevel')}
                  className="py-3.5 px-4 cursor-pointer hover:text-pink-600 transition"
                >
                  <div className="flex items-center gap-1">
                    <span>ระดับความเสี่ยง</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">ดูข้อมูล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50 text-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400">
                    ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedPerson(row)}
                    className="hover:bg-pink-50/40 transition cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-pink-700">{row.id}</td>
                    <td className="py-3 px-4 font-medium">{row.area}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${row.gender === 'ชาย' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                        {row.gender}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium">{row.age} ปี</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${row.bmi >= 25 ? 'font-bold text-rose-700 bg-rose-50' : 'text-slate-700'}`}>
                        {row.bmi}
                      </span>
                    </td>
                    {/* SBP with Conditional Formatting */}
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs inline-block ${getSBPStyle(row.sbp)}`}>
                        {row.sbp} mmHg
                      </span>
                    </td>
                    {/* Glucose with Conditional Formatting */}
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-md text-xs inline-block ${getGlucoseStyle(row.glucose)}`}>
                        {row.glucose}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{row.exercise}</td>
                    <td className="py-3 px-3 font-bold text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {row.riskScore}
                      </span>
                    </td>
                    {/* Risk Level with Conditional Formatting */}
                    <td className="py-3 px-4">{getRiskLevelBadge(row.riskLevel)}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPerson(row);
                        }}
                        className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 transition"
                        title="ดูรายละเอียดฉบับเต็ม"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50/70 border-t border-pink-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>แสดง</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-pink-200 rounded-lg px-2 py-1 text-slate-700 font-medium focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>รายการต่อหน้า • พบทั้งหมด {sortedData.length} รายการ</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-white border border-pink-200 hover:bg-pink-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-slate-700">
              หน้า {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-white border border-pink-200 hover:bg-pink-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Person Detail Modal */}
      <PersonDetailModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
};
