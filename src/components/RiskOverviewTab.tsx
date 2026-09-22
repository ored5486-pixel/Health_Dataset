import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, CartesianGrid
} from 'recharts';
import { ShieldAlert, MapPin, Users, HeartPulse, Stethoscope, Activity } from 'lucide-react';
import { HealthRecord } from '../types';

interface RiskOverviewTabProps {
  data: HealthRecord[];
}

export const RiskOverviewTab: React.FC<RiskOverviewTabProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-pink-100 shadow-sm">
        ไม่มีข้อมูลสำหรับการแสดงผลภาพรวมความเสี่ยงและพื้นที่
      </div>
    );
  }

  // 1. ระดับความเสี่ยง (Pie/Donut)
  const riskCounts = {
    'เสี่ยงต่ำ': data.filter((d) => d.riskLevel === 'ต่ำ' || d.riskLevel === 'เสี่ยงต่ำ').length,
    'เสี่ยงปานกลาง': data.filter((d) => d.riskLevel === 'ปานกลาง' || d.riskLevel === 'เสี่ยงปานกลาง').length,
    'เสี่ยงสูง': data.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length,
  };

  const riskPieData = [
    { name: 'เสี่ยงต่ำ (Low)', value: riskCounts['เสี่ยงต่ำ'], color: '#10b981' },
    { name: 'เสี่ยงปานกลาง (Med)', value: riskCounts['เสี่ยงปานกลาง'], color: '#f59e0b' },
    { name: 'เสี่ยงสูง (High)', value: riskCounts['เสี่ยงสูง'], color: '#f43f5e' },
  ];

  // 2. คะแนนความเสี่ยง (Risk Score Distribution)
  const maxScore = Math.max(7, ...data.map(d => d.riskScore || 0));
  const scoreMap: Record<number, number> = {};
  for (let s = 0; s <= maxScore; s++) scoreMap[s] = 0;
  data.forEach((d) => {
    const s = Math.max(0, d.riskScore || 0);
    scoreMap[s] = (scoreMap[s] || 0) + 1;
  });
  const riskScoreData = Object.keys(scoreMap).map((k) => ({
    score: `คะแนน ${k}`,
    scoreNum: Number(k),
    count: scoreMap[Number(k)],
  }));

  // 3. เบาหวาน_คัดกรอง
  const dmCounts = {
    'ไม่มี / ปกติ': data.filter((d) => d.diabetesScreening === 'ไม่มี' || d.diabetesScreening === 'ปกติ').length,
    'มีแนวโน้ม / เสี่ยง': data.filter((d) => d.diabetesScreening === 'มีแนวโน้ม/เสี่ยง' || d.diabetesScreening === 'กลุ่มเสี่ยง').length,
    'สงสัยป่วย': data.filter((d) => d.diabetesScreening === 'สงสัยป่วย').length,
  };
  const dmData = [
    { name: 'ไม่มี / ปกติ', count: dmCounts['ไม่มี / ปกติ'], color: '#10b981' },
    { name: 'มีแนวโน้ม / เสี่ยง', count: dmCounts['มีแนวโน้ม / เสี่ยง'], color: '#f59e0b' },
    { name: 'สงสัยป่วย', count: dmCounts['สงสัยป่วย'], color: '#e11d48' },
  ].filter(d => d.count > 0 || d.name !== 'สงสัยป่วย');

  // 4. ความดันโลหิตสูง_คัดกรอง
  const htCounts = {
    'ไม่มี / ปกติ': data.filter((d) => d.hypertensionScreening === 'ไม่มี' || d.hypertensionScreening === 'ปกติ').length,
    'มีแนวโน้ม / เสี่ยง': data.filter((d) => d.hypertensionScreening === 'มีแนวโน้ม/เสี่ยง' || d.hypertensionScreening === 'กลุ่มเสี่ยง').length,
    'สงสัยป่วย': data.filter((d) => d.hypertensionScreening === 'สงสัยป่วย').length,
  };
  const htData = [
    { name: 'ไม่มี / ปกติ', count: htCounts['ไม่มี / ปกติ'], color: '#10b981' },
    { name: 'มีแนวโน้ม / เสี่ยง', count: htCounts['มีแนวโน้ม / เสี่ยง'], color: '#f59e0b' },
    { name: 'สงสัยป่วย', count: htCounts['สงสัยป่วย'], color: '#e11d48' },
  ].filter(d => d.count > 0 || d.name !== 'สงสัยป่วย');

  // 5. พื้นที่ที่มีผู้เสี่ยงสูง
  const areas = Array.from(new Set(data.map((d) => d.area)));
  const areaHighRiskData = areas.map((area) => {
    const areaRecords = data.filter((d) => d.area === area);
    const highRisk = areaRecords.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length;
    const medRisk = areaRecords.filter((d) => d.riskLevel === 'ปานกลาง' || d.riskLevel === 'เสี่ยงปานกลาง').length;
    const lowRisk = areaRecords.filter((d) => d.riskLevel === 'ต่ำ' || d.riskLevel === 'เสี่ยงต่ำ').length;
    const total = areaRecords.length;
    return {
      area,
      highRisk,
      medRisk,
      lowRisk,
      total,
      highRiskRate: total > 0 ? ((highRisk / total) * 100).toFixed(1) : '0',
    };
  }).sort((a, b) => b.highRisk - a.highRisk);

  // 6. กลุ่มอายุที่มีความเสี่ยงสูง
  const ageBuckets = [
    { label: '< 35 ปี', min: 0, max: 34 },
    { label: '35 - 49 ปี', min: 35, max: 49 },
    { label: '50 - 59 ปี', min: 50, max: 59 },
    { label: '60+ ปี', min: 60, max: 120 },
  ];

  const ageRiskData = ageBuckets.map((bucket) => {
    const records = data.filter((d) => d.age >= bucket.min && d.age <= bucket.max);
    const high = records.filter((d) => d.riskLevel === 'สูง' || d.riskLevel === 'เสี่ยงสูง').length;
    const med = records.filter((d) => d.riskLevel === 'ปานกลาง' || d.riskLevel === 'เสี่ยงปานกลาง').length;
    const low = records.filter((d) => d.riskLevel === 'ต่ำ' || d.riskLevel === 'เสี่ยงต่ำ').length;
    return {
      ageGroup: bucket.label,
      'เสี่ยงสูง': high,
      'เสี่ยงปานกลาง': med,
      'เสี่ยงต่ำ': low,
      total: records.length,
    };
  });

  return (
    <div className="space-y-6">
      {/* Section 1: Health Risk 4 Fields */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-pink-500 text-white rounded-xl shadow-sm">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Health Risk (4 ตัวชี้วัดความเสี่ยงหลัก)
            </h3>
            <p className="text-xs text-slate-500">
              วิเคราะห์คะแนนความเสี่ยง, ระดับความเสี่ยง, เบาหวาน_คัดกรอง, ความดันโลหิตสูง_คัดกรอง
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. สัดส่วนระดับความเสี่ยง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                สัดส่วนระดับความเสี่ยง (Risk Level)
              </h4>
              <span className="text-xs text-slate-400 font-medium">รวม {data.length} คน</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} คน (${((value / data.length) * 100).toFixed(1)}%)`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-pink-50 text-center">
              <div className="p-2 rounded-xl bg-emerald-50">
                <div className="text-[11px] text-emerald-700 font-medium">เสี่ยงต่ำ</div>
                <div className="text-base font-bold text-emerald-800">{riskCounts['เสี่ยงต่ำ']} คน</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50">
                <div className="text-[11px] text-amber-700 font-medium">เสี่ยงปานกลาง</div>
                <div className="text-base font-bold text-amber-800">{riskCounts['เสี่ยงปานกลาง']} คน</div>
              </div>
              <div className="p-2 rounded-xl bg-rose-50">
                <div className="text-[11px] text-rose-700 font-medium">เสี่ยงสูง</div>
                <div className="text-base font-bold text-rose-800">{riskCounts['เสี่ยงสูง']} คน</div>
              </div>
            </div>
          </div>

          {/* 2. การกระจายของคะแนนความเสี่ยง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                การกระจายของคะแนนความเสี่ยง (1 - 15)
              </h4>
              <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                &ge; 8 คะแนน = เสี่ยงสูง
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskScoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="scoreNum" tick={{ fontSize: 11 }} label={{ value: 'คะแนนความเสี่ยง', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(val: any) => [`${val} คน`, 'จำนวนผู้รับการคัดกรอง']}
                    labelFormatter={(label) => `คะแนนความเสี่ยง: ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {riskScoreData.map((entry) => {
                      let color = '#10b981';
                      if (entry.scoreNum >= 8) color = '#f43f5e';
                      else if (entry.scoreNum >= 5) color = '#f59e0b';
                      return <Cell key={`bar-${entry.scoreNum}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-xs text-slate-500 text-center mt-2 pt-2 border-t border-pink-50">
              คะแนนคำนวณจากปัจจัย: อายุ, BMI, ความดันโลหิต, ระดับน้ำตาล, ประวัติการสูบบุหรี่ และการออกกำลังกาย
            </div>
          </div>

          {/* 3. เบาหวาน_คัดกรอง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-pink-600" />
                ผลการคัดกรองโรคเบาหวาน (Diabetes Screening)
              </h4>
              <span className="text-xs text-slate-500 font-medium">เกณฑ์ FBS (mg/dL)</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dmData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} คน (${((val / data.length) * 100).toFixed(1)}%)`, 'จำนวน']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {dmData.map((entry, index) => (
                      <Cell key={`dm-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-pink-50">
              <span>ปกติ (&lt; 100)</span>
              <span>กลุ่มเสี่ยง (100 - 125)</span>
              <span className="text-rose-600 font-medium">สงสัยป่วย (&ge; 126)</span>
            </div>
          </div>

          {/* 4. ความดันโลหิตสูง_คัดกรอง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-pink-600" />
                ผลการคัดกรองความดันโลหิตสูง (Hypertension Screening)
              </h4>
              <span className="text-xs text-slate-500 font-medium">เกณฑ์ SBP (mmHg)</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={htData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fontWeight: 500 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} คน (${((val / data.length) * 100).toFixed(1)}%)`, 'จำนวน']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {htData.map((entry, index) => (
                      <Cell key={`ht-cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-pink-50">
              <span>ปกติ (&lt; 120)</span>
              <span>กลุ่มเสี่ยง (120 - 139)</span>
              <span className="text-rose-600 font-medium">สงสัยป่วย (&ge; 140)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: พื้นที่และกลุ่มอายุที่มีความเสี่ยงสูง */}
      <div>
        <div className="flex items-center gap-2 mb-4 pt-4">
          <div className="p-2 bg-rose-500 text-white rounded-xl shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              การวิเคราะห์เชิงลึก: พื้นที่และกลุ่มอายุที่มีความเสี่ยงสูง
            </h3>
            <p className="text-xs text-slate-500">
              จำแนกสัดส่วนผู้มีความเสี่ยงสูงตามพื้นที่ชุมชนและช่วงวัยเพื่อการวางแผนเชิงรุก
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* พื้นที่ที่มีผู้เสี่ยงสูง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                พื้นที่ที่มีผู้เสี่ยงสูง (Areas with High Risk)
              </h4>
              <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                เรียงตามจำนวนเสี่ยงสูง
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaHighRiskData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="area" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} คน`, name === 'highRisk' ? 'เสี่ยงสูง' : name === 'medRisk' ? 'เสี่ยงปานกลาง' : 'เสี่ยงต่ำ']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="highRisk" name="เสี่ยงสูง" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medRisk" name="เสี่ยงปานกลาง" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="lowRisk" name="เสี่ยงต่ำ" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2 pt-3 border-t border-pink-50">
              <div className="text-xs font-semibold text-slate-600">สรุปอัตราเสี่ยงสูงรายพื้นที่:</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {areaHighRiskData.slice(0, 6).map((item) => (
                  <div key={item.area} className="p-2 rounded-xl bg-pink-50/70 border border-pink-100 text-xs">
                    <div className="font-semibold text-slate-700 truncate">{item.area}</div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-rose-600 font-bold">{item.highRisk} คน</span>
                      <span className="text-[11px] text-slate-500">({item.highRiskRate}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* กลุ่มอายุที่มีความเสี่ยงสูง */}
          <div className="bg-white/95 rounded-2xl p-5 border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" />
                กลุ่มอายุที่มีความเสี่ยงสูง (High Risk by Age Group)
              </h4>
              <span className="text-xs text-slate-500">จำแนกตามช่วงอายุ</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageRiskData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" vertical={false} />
                  <XAxis dataKey="ageGroup" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} คน`, name]}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #fbcfe8' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="เสี่ยงสูง" fill="#f43f5e" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="เสี่ยงปานกลาง" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="เสี่ยงต่ำ" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-rose-50/80 border border-rose-100 text-xs text-rose-800">
              💡 <strong>ข้อสังเกตทางการแพทย์:</strong> กลุ่มอายุ 60 ปีขึ้นไป และ 50-59 ปี มีสัดส่วนผู้มีความเสี่ยงสูงอย่างมีนัยสำคัญ ควรจัดโปรแกรมติดตามสุขภาพเชิงรุกและให้ความรู้เรื่องการควบคุมระดับน้ำตาลและความดัน
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
