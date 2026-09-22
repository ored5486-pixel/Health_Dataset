import React from 'react';
import { X, User, HeartPulse, Activity, Droplets, Calendar, MapPin, Cigarette, Wine, Dumbbell } from 'lucide-react';
import { HealthRecord } from '../types';

interface PersonDetailModalProps {
  person: HealthRecord | null;
  onClose: () => void;
}

export const PersonDetailModal: React.FC<PersonDetailModalProps> = ({ person, onClose }) => {
  if (!person) return null;

  const isHighRisk = person.riskLevel.includes('สูง');
  const isMedRisk = person.riskLevel.includes('กลาง');

  const getScreeningColor = (val: string) => {
    if (val.includes('สงสัย') || val.includes('ป่วย')) return 'bg-rose-100 text-rose-800 border-rose-200';
    if (val.includes('เสี่ยง') || val.includes('แนวโน้ม')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold">{person.id}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      isHighRisk
                        ? 'bg-rose-500 text-white border-white/40'
                        : isMedRisk
                        ? 'bg-amber-400 text-slate-900 border-white/40'
                        : 'bg-emerald-400 text-slate-900 border-white/40'
                    }`}
                  >
                    {person.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-pink-100 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {person.area} • เพศ{person.gender} • อายุ {person.age} ปี
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Risk Score Spotlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-600">คะแนนความเสี่ยงสะสม</div>
              <div className="text-2xl font-black text-rose-600">
                {person.riskScore} <span className="text-xs font-normal text-slate-500">คะแนน</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-600">วันที่ตรวจประเมิน</div>
              <div className="text-xs font-medium text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                {person.checkDate} {person.month ? `(${person.month})` : ''}
              </div>
            </div>
          </div>

          {/* Vitals Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              ตัวชี้วัดสุขภาพทางคลินิก (Clinical Vitals)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* BMI */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium">BMI (กก./ม.²)</div>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{person.bmi}</div>
                <div className="text-[10px] text-slate-500">
                  {person.weight && person.height ? `${person.weight}kg / ${person.height}cm` : (person.bmi >= 25 ? '⚠️ เกินเกณฑ์' : '✅ เกณฑ์ปกติ')}
                </div>
              </div>

              {/* SBP / DBP */}
              <div
                className={`p-3 rounded-2xl border ${
                  person.sbp >= 140
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : person.sbp >= 120
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="text-[11px] font-medium flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" />
                  ความดันโลหิต
                </div>
                <div className="text-lg font-bold mt-0.5">
                  {person.sbp}{person.dbp ? `/${person.dbp}` : ''} <span className="text-[10px]">mmHg</span>
                </div>
                <div className="text-[10px] font-medium">
                  {person.sbp >= 140 ? '🔴 สูง' : person.sbp >= 120 ? '🟡 เสี่ยง' : '🟢 ปกติ'}
                </div>
              </div>

              {/* Glucose */}
              <div
                className={`p-3 rounded-2xl border ${
                  person.glucose >= 126
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : person.glucose >= 100
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="text-[11px] font-medium flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" />
                  น้ำตาล FBS
                </div>
                <div className="text-lg font-bold mt-0.5">{person.glucose} <span className="text-[10px]">mg/dL</span></div>
                <div className="text-[10px] font-medium">
                  {person.glucose >= 126 ? '🔴 สงสัยป่วย' : person.glucose >= 100 ? '🟡 เสี่ยง' : '🟢 ปกติ'}
                </div>
              </div>

              {/* Pulse */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <HeartPulse className="w-3.5 h-3.5 text-pink-500" />
                  ชีพจร (Pulse)
                </div>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{person.pulse} <span className="text-[10px]">bpm</span></div>
                <div className="text-[10px] text-slate-500">อัตราการเต้นหัวใจ</div>
              </div>
            </div>
          </div>

          {/* Screening Diagnostics */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              ผลการคัดกรองโรคเรื้อรัง (NCDs Screening)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">เบาหวาน_คัดกรอง</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{person.diabetesScreening}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScreeningColor(person.diabetesScreening)}`}
                >
                  {person.diabetesScreening}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-pink-100 shadow-xs flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">ความดันโลหิตสูง_คัดกรอง</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5">{person.hypertensionScreening}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getScreeningColor(person.hypertensionScreening)}`}
                >
                  {person.hypertensionScreening}
                </span>
              </div>
            </div>
          </div>

          {/* Behavior Profile */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              พฤติกรรมสุขภาพ (Health Behavior)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Cigarette className="w-4 h-4 mx-auto text-slate-600 mb-1" />
                <div className="text-[10px] text-slate-500">การสูบบุหรี่</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{person.smoking}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Wine className="w-4 h-4 mx-auto text-slate-600 mb-1" />
                <div className="text-[10px] text-slate-500">การดื่มแอลกอฮอล์</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{person.alcohol}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <Dumbbell className="w-4 h-4 mx-auto text-slate-600 mb-1" />
                <div className="text-[10px] text-slate-500">การออกกำลังกาย</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">{person.exercise}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-md transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
