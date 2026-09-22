import React from 'react';
import { Users, Droplets, HeartPulse, AlertTriangle, TrendingUp, Heart } from 'lucide-react';
import { HealthRecord } from '../types';

interface KPICardsProps {
  data: HealthRecord[];
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const total = data.length;

  if (total === 0) {
    return (
      <div className="bg-white/90 p-8 rounded-2xl border border-pink-100 text-center text-slate-500 mb-8">
        ไม่พบข้อมูลตามเงื่อนไขที่เลือก กรุณาปรับเปลี่ยนตัวกรองข้อมูล
      </div>
    );
  }

  // 1. จำนวน: จำนวนผู้เข้ารับการคัดกรองทั้งหมด
  const totalScreened = total;

  // 2. ค่าเฉลี่ย: ระดับน้ำตาลในเลือดเฉลี่ย และ คะแนนความเสี่ยงเฉลี่ย
  const sumGlucose = data.reduce((acc, cur) => acc + cur.glucose, 0);
  const avgGlucose = (sumGlucose / total).toFixed(1);

  const sumRiskScore = data.reduce((acc, cur) => acc + cur.riskScore, 0);
  const avgRiskScore = (sumRiskScore / total).toFixed(1);

  // 3. ค่าต่ำสุด/ค่าสูงสุด: ช่วงความดันโลหิต SBP (Min - Max)
  const sbpValues = data.map((d) => d.sbp);
  const minSBP = Math.min(...sbpValues);
  const maxSBP = Math.max(...sbpValues);

  // 4. สัดส่วน/ร้อยละ: ร้อยละของผู้ที่มีความเสี่ยงสูง
  const highRiskCount = data.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length;
  const highRiskPercentage = ((highRiskCount / total) * 100).toFixed(1);

  // Additional context metrics
  const moderateRiskCount = data.filter((d) => d.riskLevel === 'ปานกลาง' || d.riskLevel === 'เสี่ยงปานกลาง').length;
  const lowRiskCount = data.filter((d) => d.riskLevel === 'ต่ำ' || d.riskLevel === 'เสี่ยงต่ำ').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* KPI 1: จำนวนผู้เข้ารับการคัดกรองทั้งหมด */}
      <div className="relative overflow-hidden bg-white/95 rounded-2xl p-5 border border-pink-200/80 shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 transition group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-pink-500 bg-pink-50 px-2 py-0.5 rounded-md">
              จำนวนทั้งหมด (Count)
            </span>
            <h4 className="text-slate-600 text-sm font-medium pt-1">
              ผู้เข้ารับการคัดกรองทั้งหมด
            </h4>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {totalScreened.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500">คน</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>เสี่ยงต่ำ: {lowRiskCount} คน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>ปานกลาง: {moderateRiskCount} คน</span>
          </div>
        </div>
      </div>

      {/* KPI 2: ค่าเฉลี่ย ระดับน้ำตาลในเลือดเฉลี่ย และ คะแนนความเสี่ยงเฉลี่ย */}
      <div className="relative overflow-hidden bg-white/95 rounded-2xl p-5 border border-pink-200/80 shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 transition group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
              ค่าเฉลี่ยสุขภาพ (Mean)
            </span>
            <h4 className="text-slate-600 text-sm font-medium pt-1">
              ระดับน้ำตาลในเลือดเฉลี่ย
            </h4>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {avgGlucose}
              </span>
              <span className="text-xs font-semibold text-slate-500">mg/dL</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Droplets className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-pink-500" />
            คะแนนความเสี่ยงเฉลี่ย:
          </span>
          <span className="font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-lg border border-pink-200/50">
            {avgRiskScore} คะแนน
          </span>
        </div>
      </div>

      {/* KPI 3: ค่าต่ำสุด/ค่าสูงสุด ช่วงความดันโลหิต SBP (Min - Max) */}
      <div className="relative overflow-hidden bg-white/95 rounded-2xl p-5 border border-pink-200/80 shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 transition group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-fuchsia-600 bg-fuchsia-50 px-2 py-0.5 rounded-md">
              ช่วงความดัน (Min - Max)
            </span>
            <h4 className="text-slate-600 text-sm font-medium pt-1">
              ช่วงความดันโลหิต SBP
            </h4>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {minSBP} - {maxSBP}
              </span>
              <span className="text-xs font-semibold text-slate-500">mmHg</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl text-white shadow-md shadow-fuchsia-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between text-xs text-slate-500">
          <span>เกณฑ์ปกติ: &lt; 120 mmHg</span>
          <span className="text-rose-600 font-semibold flex items-center gap-1">
            <Heart className="w-3 h-3 text-rose-500" />
            เสี่ยงสูง: &ge; 140
          </span>
        </div>
      </div>

      {/* KPI 4: สัดส่วน/ร้อยละ ร้อยละของผู้ที่มีความเสี่ยงสูง */}
      <div className="relative overflow-hidden bg-white/95 rounded-2xl p-5 border border-pink-200/80 shadow-md shadow-pink-500/5 hover:shadow-lg hover:shadow-pink-500/10 transition group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
              สัดส่วนความเสี่ยง (Ratio)
            </span>
            <h4 className="text-slate-600 text-sm font-medium pt-1">
              ร้อยละผู้มีความเสี่ยงสูง
            </h4>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {highRiskPercentage}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({highRiskCount} คน)
              </span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-pink-50">
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, parseFloat(highRiskPercentage)))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
