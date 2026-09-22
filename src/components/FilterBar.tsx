import React from 'react';
import { Filter, RotateCcw, Search, MapPin, Users, HeartPulse, UserCheck } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  areaOptions: string[];
  totalRecords: number;
  filteredRecordsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  areaOptions,
  totalRecords,
  filteredRecordsCount,
}) => {
  const handleReset = () => {
    onFilterChange({
      area: 'ทั้งหมด',
      ageGroup: 'ทั้งหมด',
      gender: 'ทั้งหมด',
      riskLevel: 'ทั้งหมด',
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    filters.area !== 'ทั้งหมด' ||
    filters.ageGroup !== 'ทั้งหมด' ||
    filters.gender !== 'ทั้งหมด' ||
    filters.riskLevel !== 'ทั้งหมด' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 mb-8 border border-pink-100 shadow-sm shadow-pink-100/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-pink-50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-100 text-pink-600 rounded-xl">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">ตัวกรองข้อมูลสุขภาพ (Filters)</h3>
            <p className="text-xs text-slate-500">กรองตามมิติพื้นที่ ประชากรศาสตร์ และระดับความเสี่ยงสุขภาพ</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 bg-pink-50 border border-pink-200/60 px-3 py-1 rounded-full font-medium">
            แสดง <strong className="text-pink-600 font-bold">{filteredRecordsCount}</strong> จากทั้งหมด {totalRecords} รายการ
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-pink-600 bg-pink-50 hover:bg-pink-100 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Filter 1: พื้นที่ */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-pink-500" />
            <span>พื้นที่ (Area)</span>
          </label>
          <select
            value={filters.area}
            onChange={(e) => onFilterChange({ ...filters, area: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          >
            <option value="ทั้งหมด">พื้นที่ทั้งหมด</option>
            {areaOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Filter 2: ช่วงอายุ */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-pink-500" />
            <span>ช่วงอายุ (Age Range)</span>
          </label>
          <select
            value={filters.ageGroup}
            onChange={(e) => onFilterChange({ ...filters, ageGroup: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          >
            <option value="ทั้งหมด">ทุกช่วงอายุ</option>
            <option value="น้อยกว่า 35 ปี">น้อยกว่า 35 ปี</option>
            <option value="35-49 ปี">35 - 49 ปี</option>
            <option value="50-59 ปี">50 - 59 ปี</option>
            <option value="60 ปีขึ้นไป">60 ปีขึ้นไป (ผู้สูงอายุ)</option>
          </select>
        </div>

        {/* Filter 3: เพศ */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-pink-500" />
            <span>เพศ (Gender)</span>
          </label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange({ ...filters, gender: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          >
            <option value="ทั้งหมด">ทุกเพศ</option>
            <option value="ชาย">ชาย</option>
            <option value="หญิง">หญิง</option>
          </select>
        </div>

        {/* Filter 4: ระดับความเสี่ยง */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-pink-500" />
            <span>ระดับความเสี่ยง (Risk Level)</span>
          </label>
          <select
            value={filters.riskLevel}
            onChange={(e) => onFilterChange({ ...filters, riskLevel: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
          >
            <option value="ทั้งหมด">ทุกระดับความเสี่ยง</option>
            <option value="เสี่ยงต่ำ">🟢 เสี่ยงต่ำ (Low Risk)</option>
            <option value="เสี่ยงปานกลาง">🟡 เสี่ยงปานกลาง (Moderate)</option>
            <option value="เสี่ยงสูง">🔴 เสี่ยงสูง (High Risk)</option>
          </select>
        </div>

        {/* Quick Search */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-pink-500" />
            <span>ค้นหา (Search)</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="รหัสบุคคล, พื้นที่..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              className="w-full text-xs font-medium bg-white border border-pink-200 rounded-xl pl-8 pr-3 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
