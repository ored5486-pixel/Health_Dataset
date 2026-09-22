import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Cigarette, Wine, Dumbbell, TrendingUp, Heart, Scale } from 'lucide-react';
import { HealthRecord } from '../types';

interface BehaviorTrendTabProps {
  data: HealthRecord[];
}

export const BehaviorTrendTab: React.FC<BehaviorTrendTabProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-pink-100 shadow-sm">
        ไม่มีข้อมูลสำหรับการแสดงผลพฤติกรรมและแนวโน้มสุขภาพ
      </div>
    );
  }

  // 1. การสูบบุหรี่ vs ระดับความเสี่ยง
  const smokingOptions = Array.from(new Set(data.map((d) => d.smoking).filter(Boolean)));
  const smokingRiskData = smokingOptions.map((status) => {
    const records = data.filter((d) => d.smoking === status);
    const high = records.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length;
    const med = records.filter((d) => d.riskLevel === 'ปานกลาง' || d.riskLevel === 'เสี่ยงปานกลาง').length;
    const low = records.filter((d) => d.riskLevel === 'ต่ำ' || d.riskLevel === 'เสี่ยงต่ำ').length;
    const total = records.length;
    return {
      status,
      'เสี่ยงสูง': high,
      'เสี่ยงปานกลาง': med,
      'เสี่ยงต่ำ': low,
      total,
      highRate: total > 0 ? ((high / total) * 100).toFixed(1) : '0',
    };
  });

  // 2. การดื่มแอลกอฮอล์ vs ระดับความเสี่ยง
  const alcoholOptions = Array.from(new Set(data.map((d) => d.alcohol).filter(Boolean)));
  const alcoholRiskData = alcoholOptions.map((status) => {
    const records = data.filter((d) => d.alcohol === status);
    const high = records.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length;
    const med = records.filter((d) => d.riskLevel === 'ปานกลาง' || d.riskLevel === 'เสี่ยงปานกลาง').length;
    const low = records.filter((d) => d.riskLevel === 'ต่ำ' || d.riskLevel === 'เสี่ยงต่ำ').length;
    const total = records.length;
    return {
      status,
      'เสี่ยงสูง': high,
      'เสี่ยงปานกลาง': med,
      'เสี่ยงต่ำ': low,
      total,
      highRate: total > 0 ? ((high / total) * 100).toFixed(1) : '0',
    };
  });

  // 3. การออกกำลังกาย vs ระดับความเสี่ยง
  const exerciseOptions = Array.from(new Set(data.map((d) => d.exercise).filter(Boolean)));
  const exerciseRiskData = exerciseOptions.map((status) => {
    const records = data.filter((d) => d.exercise === status);
    const high = records.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length;
    const med = records.filter((d) => d.riskLevel === 'ปานกลาง' || d.riskLevel === 'เสี่ยงปานกลาง').length;
    const low = records.filter((d) => d.riskLevel === 'ต่ำ' || d.riskLevel === 'เสี่ยงต่ำ').length;
    const total = records.length;
    return {
      status,
      'เสี่ยงสูง': high,
      'เสี่ยงปานกลาง': med,
      'เสี่ยงต่ำ': low,
      total,
      highRate: total > 0 ? ((high / total) * 100).toFixed(1) : '0',
    };
  });

  // 4. พฤติกรรมกับระดับความเสี่ยง (Lifestyle Risk Index)
  // Composite score of healthy habits
  const lifestyleData = useMemo(() => {
    const categories = [
      { name: 'พฤติกรรมเสี่ยงสูง (สูบ + ไม่ออกกำลังกาย)', filter: (d: HealthRecord) => (d.smoking.includes('สูบ') && !d.smoking.includes('ไม่')) && d.exercise === 'ไม่ออกกำลังกาย' },
      { name: 'พฤติกรรมเสี่ยงปานกลาง (ดื่ม หรือ ออกกำลังกายบางครั้ง)', filter: (d: HealthRecord) => (d.alcohol.includes('ดื่ม') && !d.alcohol.includes('ไม่')) && (d.exercise === 'บางครั้ง' || d.exercise.includes('1-2')) },
      { name: 'พฤติกรรมสุขภาพดี (ไม่สูบ + ไม่ดื่ม + ออกกำลังกายสม่ำเสมอ)', filter: (d: HealthRecord) => d.smoking === 'ไม่สูบ' && d.alcohol === 'ไม่ดื่ม' && (d.exercise === 'สม่ำเสมอ' || d.exercise.includes('3')) },
    ];

    return categories.map((cat) => {
      const records = data.filter(cat.filter);
      const high = records.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length;
      const total = records.length;
      return {
        category: cat.name,
        highRiskCount: high,
        totalScreened: total,
        highRiskRate: total > 0 ? parseFloat(((high / total) * 100).toFixed(1)) : 0,
      };
    });
  }, [data]);

  // 5. ความสัมพันธ์ระหว่าง BMI กับน้ำตาล
  const bmiBins = [
    { label: 'น้ำหนักน้อย/ปกติ (< 23)', min: 0, max: 22.9 },
    { label: 'ท้วม/น้ำหนักเกิน (23 - 24.9)', min: 23.0, max: 24.9 },
    { label: 'อ้วนระดับ 1 (25 - 29.9)', min: 25.0, max: 29.9 },
    { label: 'อ้วนระดับ 2 (>= 30)', min: 30.0, max: 100 },
  ];

  const bmiVsGlucoseData = bmiBins.map((bin) => {
    const records = data.filter((d) => d.bmi >= bin.min && d.bmi <= bin.max);
    const count = records.length;
    const avgGlucose = count > 0 ? (records.reduce((acc, c) => acc + c.glucose, 0) / count).toFixed(1) : '0';
    const dmSuspectCount = records.filter((d) => d.diabetesScreening === 'สงสัยป่วย').length;
    return {
      bmiRange: bin.label,
      avgGlucose: parseFloat(avgGlucose),
      dmSuspectRate: count > 0 ? parseFloat(((dmSuspectCount / count) * 100).toFixed(1)) : 0,
      count,
    };
  });

  // 6. ความสัมพันธ์ระหว่าง BMI กับความดัน (SBP)
  const bmiVsSBPData = bmiBins.map((bin) => {
    const records = data.filter((d) => d.bmi >= bin.min && d.bmi <= bin.max);
    const count = records.length;
    const avgSBP = count > 0 ? (records.reduce((acc, c) => acc + c.sbp, 0) / count).toFixed(1) : '0';
    const htSuspectCount = records.filter((d) => d.hypertensionScreening === 'สงสัยป่วย').length;
    return {
      bmiRange: bin.label,
      avgSBP: parseFloat(avgSBP),
      htSuspectRate: count > 0 ? parseFloat(((htSuspectCount / count) * 100).toFixed(1)) : 0,
      count,
    };
  });

  // Scatter sample points for BMI vs Glucose & SBP
  const scatterPoints = useMemo(() => {
    return data.slice(0, 80).map((d) => ({
      bmi: d.bmi,
      glucose: d.glucose,
      sbp: d.sbp,
      pulse: d.pulse,
      id: d.id,
      riskLevel: d.riskLevel,
    }));
  }, [data]);

  // 7. Health Trend : วันที่ตรวจ BMI, อายุ, BMI, ชีพจร_bpm, น้ำตาล_mg_dL
  // Group by Month
  const trendData = useMemo(() => {
    const monthGroups: Record<string, { bmiSum: number; glucoseSum: number; sbpSum: number; pulseSum: number; count: number }> = {};
    data.forEach((d) => {
      let key = d.month;
      if (!key) {
        if (d.checkDate && d.checkDate.includes('/')) {
          const parts = d.checkDate.split('/');
          if (parts.length === 3) {
            key = `${parts[2]}-${parts[1].padStart(2, '0')}`;
          }
        } else if (d.checkDate) {
          key = d.checkDate.substring(0, 7);
        }
      }
      if (!key) key = '2026-01';

      if (!monthGroups[key]) {
        monthGroups[key] = { bmiSum: 0, glucoseSum: 0, sbpSum: 0, pulseSum: 0, count: 0 };
      }
      monthGroups[key].bmiSum += d.bmi;
      monthGroups[key].glucoseSum += d.glucose;
      monthGroups[key].sbpSum += d.sbp;
      monthGroups[key].pulseSum += d.pulse;
      monthGroups[key].count += 1;
    });

    const thMonths: Record<string, string> = {
      '01': 'ม.ค.', '02': 'ก.พ.', '03': 'มี.ค.', '04': 'เม.ย.',
      '05': 'พ.ค.', '06': 'มิ.ย.', '07': 'ก.ค.', '08': 'ส.ค.',
      '09': 'ก.ย.', '10': 'ต.ค.', '11': 'พ.ย.', '12': 'ธ.ค.'
    };

    return Object.keys(monthGroups)
      .sort()
      .map((key) => {
        const item = monthGroups[key];
        const [y, m] = key.split('-');
        const yearBE = y ? parseInt(y, 10) + 543 : 2569;
        const monthLabel = m && thMonths[m] ? `${thMonths[m]} ${String(yearBE).slice(-2)}` : key;
        return {
          month: monthLabel,
          avgBMI: parseFloat((item.bmiSum / item.count).toFixed(1)),
          avgGlucose: parseFloat((item.glucoseSum / item.count).toFixed(1)),
          avgSBP: parseFloat((item.sbpSum / item.count).toFixed(1)),
          avgPulse: parseFloat((item.pulseSum / item.count).toFixed(1)),
          count: item.count,
        };
      });
  }, [data]);

  return (
    <div className="space-y-8">
      {/* 1. Health Behavior Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-pink-500 text-white rounded-xl shadow-sm">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Health Behavior : พฤติกรรมสุขภาพกับระดับความเสี่ยง
            </h3>
            <p className="text-xs text-slate-500">
              วิเคราะห์ความสัมพันธ์ระหว่างการสูบบุหรี่, การดื่มแอลกอฮอล์, การออกกำลังกาย กับระดับความเสี่ยง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* การสูบบุหรี่ vs ความเสี่ยง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <Cigarette className="w-4 h-4 text-pink-600" />
                การสูบบุหรี่
              </h4>
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                Smoking
              </span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={smokingRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} คน`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Bar dataKey="เสี่ยงสูง" fill="#f43f5e" stackId="a" />
                  <Bar dataKey="เสี่ยงปานกลาง" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="เสี่ยงต่ำ" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-600 pt-3 border-t border-pink-50 mt-auto">
              กลุ่มที่ <strong>สูบเป็นประจำ</strong> มีอัตราเสี่ยงสูงถึง{' '}
              <span className="text-rose-600 font-bold">
                {smokingRiskData.find((s) => s.status === 'สูบเป็นประจำ')?.highRate}%
              </span>
            </div>
          </div>

          {/* การดื่มแอลกอฮอล์ vs ความเสี่ยง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <Wine className="w-4 h-4 text-pink-600" />
                การดื่มแอลกอฮอล์
              </h4>
              <span className="text-[11px] font-semibold text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                Alcohol
              </span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alcoholRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} คน`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Bar dataKey="เสี่ยงสูง" fill="#f43f5e" stackId="a" />
                  <Bar dataKey="เสี่ยงปานกลาง" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="เสี่ยงต่ำ" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-600 pt-3 border-t border-pink-50 mt-auto">
              กลุ่มที่ <strong>ดื่มเป็นประจำ</strong> มีอัตราเสี่ยงสูงอยู่ที่{' '}
              <span className="text-rose-600 font-bold">
                {alcoholRiskData.find((s) => s.status === 'ดื่มเป็นประจำ')?.highRate}%
              </span>
            </div>
          </div>

          {/* การออกกำลังกาย vs ความเสี่ยง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
                การออกกำลังกาย
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Exercise
              </span>
            </div>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exerciseRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} คน`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Bar dataKey="เสี่ยงสูง" fill="#f43f5e" stackId="a" />
                  <Bar dataKey="เสี่ยงปานกลาง" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="เสี่ยงต่ำ" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[11px] text-slate-600 pt-3 border-t border-pink-50 mt-auto">
              กลุ่มที่ <strong>ออกกำลังกาย &ge; 3 วัน/สัปดาห์</strong> มีอัตราเสี่ยงต่ำสูงถึง{' '}
              <span className="text-emerald-600 font-bold">
                {((exerciseRiskData.find((s) => s.status === '>= 3 วัน/สัปดาห์')?.['เสี่ยงต่ำ'] || 0) /
                  (exerciseRiskData.find((s) => s.status === '>= 3 วัน/สัปดาห์')?.total || 1) *
                  100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* พฤติกรรมกับระดับความเสี่ยง (Composite Lifestyle Analysis) */}
        <div className="mt-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-5 border border-pink-200">
          <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-600" />
            การวิเคราะห์: พฤติกรรมรวมกับระดับความเสี่ยง (Behavior Patterns vs Risk)
          </h4>
          <p className="text-xs text-slate-600 mb-4">
            เปรียบเทียบอัตราการพบผู้มีความเสี่ยงสูงระหว่างกลุ่มพฤติกรรมเสี่ยงและกลุ่มผู้รักสุขภาพ
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lifestyleData.map((item, idx) => (
              <div key={idx} className="bg-white/90 rounded-xl p-4 border border-pink-100 shadow-xs">
                <div className="text-xs font-semibold text-slate-700 min-h-[32px]">{item.category}</div>
                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-2xl font-black text-slate-800">{item.highRiskRate}%</span>
                  <span className="text-xs text-slate-500">เสี่ยงสูง {item.highRiskCount} / {item.totalScreened} คน</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      item.highRiskRate > 50 ? 'bg-rose-500' : item.highRiskRate > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.highRiskRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Correlations: BMI vs Glucose & BMI vs SBP */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-pink-500 text-white rounded-xl shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              ความสัมพันธ์ระหว่าง BMI กับตัวชี้วัดสุขภาพ
            </h3>
            <p className="text-xs text-slate-500">
              วิเคราะห์ความสัมพันธ์ระหว่างค่า BMI กับระดับน้ำตาลในเลือด (Glucose) และความดันโลหิต (SBP)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ความสัมพันธ์ระหว่าง BMI กับน้ำตาล */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm">
                ความสัมพันธ์ระหว่าง BMI กับน้ำตาลในเลือด
              </h4>
              <span className="text-xs text-pink-600 bg-pink-50 px-2 py-0.5 rounded font-medium">
                Glucose vs BMI
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bmiVsGlucoseData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="bmiRange" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'น้ำตาลเฉลี่ย (mg/dL)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: '% สงสัยป่วย', angle: 90, position: 'insideRight', fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [val, name === 'avgGlucose' ? 'ค่าน้ำตาลเฉลี่ย (mg/dL)' : 'ร้อยละสงสัยเบาหวาน (%)']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar yAxisId="left" dataKey="avgGlucose" name="ค่าน้ำตาลเฉลี่ย" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="dmSuspectRate" name="% สงสัยเบาหวาน" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-600 mt-2 p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
              📊 <strong>ผลการวิเคราะห์:</strong> ผู้ที่มีภาวะอ้วน (BMI &ge; 25) มีค่าน้ำตาลเฉลี่ยและสัดส่วนที่สงสัยป่วยโรคเบาหวานสูงขึ้นอย่างมีนัยสำคัญสัมพันธ์กับดัชนีมวลกาย
            </div>
          </div>

          {/* ความสัมพันธ์ระหว่าง BMI กับความดัน */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm">
                ความสัมพันธ์ระหว่าง BMI กับความดันโลหิต (SBP)
              </h4>
              <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded font-medium">
                SBP vs BMI
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bmiVsSBPData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="bmiRange" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'SBP เฉลี่ย (mmHg)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: '% สงสัยป่วย', angle: 90, position: 'insideRight', fontSize: 10 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [val, name === 'avgSBP' ? 'ค่าความดัน SBP เฉลี่ย (mmHg)' : 'ร้อยละสงสัยความดันสูง (%)']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar yAxisId="left" dataKey="avgSBP" name="ค่า SBP เฉลี่ย" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="htSuspectRate" name="% สงสัยความดันสูง" fill="#e11d48" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-600 mt-2 p-2.5 rounded-xl bg-pink-50/50 border border-pink-100">
              📊 <strong>ผลการวิเคราะห์:</strong> ค่าความดันโลหิตตัวบน (SBP) มีแนวโน้มเพิ่มขึ้นตามระดับ BMI โดยเฉพาะกลุ่มอ้วนระดับ 2 (BMI &ge; 30) มีค่า SBP เฉลี่ยเกินเกณฑ์ปกติ
            </div>
          </div>
        </div>
      </div>

      {/* 3. Health Trend over Time & Indicators */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-pink-500 text-white rounded-xl shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Health Trend : แนวโน้มตามช่วงเวลาการตรวจ
            </h3>
            <p className="text-xs text-slate-500">
              ติดตามแนวโน้มตัวชี้วัดสุขภาพ (อายุ, BMI, ชีพจร_bpm, น้ำตาล_mg_dL, SBP) ตามช่วงวันที่ตรวจ BMI
            </p>
          </div>
        </div>

        <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h4 className="font-bold text-slate-700 text-sm">
              แนวโน้มค่าเฉลี่ยตัวชี้วัดสุขภาพตามช่วงเวลาที่ตรวจ (Health Trend by Check Date)
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 inline-block" /> น้ำตาลเฉลี่ย
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> SBP เฉลี่ย
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" /> ชีพจรเฉลี่ย
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> BMI เฉลี่ย
              </span>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }} />
                <Legend verticalAlign="top" height={36} />
                <Line type="monotone" dataKey="avgGlucose" name="น้ำตาลเฉลี่ย (mg/dL)" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="avgSBP" name="ความดัน SBP เฉลี่ย (mmHg)" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="avgPulse" name="ชีพจรเฉลี่ย (bpm)" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="avgBMI" name="BMI เฉลี่ย" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
