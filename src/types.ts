export type RiskLevel = 'ต่ำ' | 'ปานกลาง' | 'สูง' | 'เสี่ยงต่ำ' | 'เสี่ยงปานกลาง' | 'เสี่ยงสูง';
export type ScreeningResult = 'ไม่มี' | 'มีแนวโน้ม/เสี่ยง' | 'ปกติ' | 'กลุ่มเสี่ยง' | 'สงสัยป่วย';
export type SmokingStatus = string;
export type AlcoholStatus = string;
export type ExerciseStatus = string;
export type Gender = 'ชาย' | 'หญิง';

export interface HealthRecord {
  id: string; // รหัสบุคคล เช่น H0001
  area: string; // พื้นที่ เช่น เมือง, เหนือ, ตะวันออก, ตะวันตก, ใต้
  gender: Gender; // เพศ
  age: number; // อายุ
  height?: number; // ส่วนสูง_cm
  weight?: number; // น้ำหนัก_kg
  bmi: number; // BMI
  sbp: number; // ความดันตัวบน SBP_mmHg
  dbp?: number; // ความดันตัวล่าง DBP_mmHg
  glucose: number; // น้ำตาลในเลือด (mg/dL)
  pulse: number; // ชีพจร (bpm)
  checkDate: string; // วันที่คัดกรอง
  smoking: SmokingStatus; // การสูบบุหรี่
  alcohol: AlcoholStatus; // การดื่มแอลกอฮอล์
  exercise: ExerciseStatus; // การออกกำลังกาย
  riskScore: number; // คะแนนความเสี่ยง
  riskLevel: RiskLevel; // ระดับความเสี่ยง
  diabetesScreening: ScreeningResult; // เบาหวาน_คัดกรอง
  hypertensionScreening: ScreeningResult; // ความดันโลหิตสูง_คัดกรอง
  month?: string; // เดือน เช่น 2026-01
}

export interface FilterState {
  area: string;
  ageGroup: string;
  gender: string;
  riskLevel: string;
  searchQuery: string;
}

export type TabType = 'tab1_overview' | 'tab2_behavior' | 'tab3_detail';

