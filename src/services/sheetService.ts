import { HealthRecord, Gender, RiskLevel, ScreeningResult, SmokingStatus, AlcoholStatus, ExerciseStatus } from '../types';
import { getInitialDataset } from '../data/defaultHealthData';

export const TARGET_SHEET_ID = "1bqsihfCpoq-Hk0abXgdnrrx1AQIcsmiFX6eRqDFJeew";

// Parse a single CSV or TSV (tab-separated) row, taking into account quotes
function parseCSVLine(text: string): string[] {
  // Check if delimiter is tab (e.g. copied directly from Google Sheets with Ctrl+C)
  const isTab = text.includes('\t') && (!text.includes(',') || text.split('\t').length >= text.split(',').length);
  const delimiter = isTab ? '\t' : ',';

  const result: string[] = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        curr += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(curr.trim());
      curr = '';
    } else {
      curr += char;
    }
  }
  result.push(curr.trim());
  return result;
}

export function parseCSVToHealthRecords(csvText: string): HealthRecord[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const rawHeaders = parseCSVLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());

  // Map header index to field
  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    const clean = h.toLowerCase().replace(/[\s_\-]/g, '');
    headerMap[clean] = idx;
    headerMap[h] = idx;
  });

  const findCol = (...names: string[]): number => {
    // 1. Exact match or stripped match
    for (const name of names) {
      if (headerMap[name] !== undefined) return headerMap[name];
      const clean = name.toLowerCase().replace(/[\s_\-\(\)\/]/g, '');
      if (headerMap[clean] !== undefined) return headerMap[clean];
    }
    // 2. Substring match against raw headers
    for (let i = 0; i < rawHeaders.length; i++) {
      const hLower = rawHeaders[i].toLowerCase();
      for (const name of names) {
        const nLower = name.toLowerCase();
        if (hLower.includes(nLower) || nLower.includes(hLower)) {
          return i;
        }
      }
    }
    return -1;
  };

  const idCol = findCol("รหัสบุคคล", "รหัส", "id", "personid", "pid", "no", "ลำดับ");
  const areaCol = findCol("พื้นที่", "ตำบล", "เขต", "area", "zone", "address", "หมู่บ้าน", "ชุมชน");
  const genderCol = findCol("เพศ", "gender", "sex");
  const ageCol = findCol("อายุ", "age");
  const bmiCol = findCol("bmi", "ดัชนีมวลกาย", "ดัชนีมวลกาย_bmi");
  const sbpCol = findCol("sbp", "ความดัน", "ความดันโลหิต", "ความดันตัวบน", "bloodpressure");
  const glucoseCol = findCol("น้ำตาล_mg_dL", "น้ำตาล", "glucose", "fbs", "bloodsugar", "น้ำตาลในเลือด", "ระดับน้ำตาล");
  const pulseCol = findCol("ชีพจร_bpm", "ชีพจร", "pulse", "heartrate", "bpm", "หัวใจ");
  const dateCol = findCol("วันที่ตรวจ BMI", "วันที่ตรวจ", "วันที่", "date", "checkdate", "วันที่คัดกรอง");
  const smokingCol = findCol("การสูบบุหรี่", "สูบบุหรี่", "smoking", "smoke", "บุหรี่");
  const alcoholCol = findCol("การดื่มแอลกอฮอล์", "ดื่มแอลกอฮอล์", "แอลกอฮอล์", "alcohol", "drink", "สุรา");
  const exerciseCol = findCol("การออกกำลังกาย", "ออกกำลังกาย", "exercise", "กิจกรรมทางกาย");
  const riskScoreCol = findCol("คะแนนความเสี่ยง", "คะแนน", "riskscore", "score");
  const riskLevelCol = findCol("ระดับความเสี่ยง", "risklevel", "risk");
  const dmCol = findCol("เบาหวาน_คัดกรอง", "เบาหวาน", "diabetes", "dm");
  const htCol = findCol("ความดันโลหิตสูง_คัดกรอง", "ความดันโลหิตสูง", "ความดันสูง", "hypertension", "ht");

  const records: HealthRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 3) continue;

    const id = idCol >= 0 && row[idCol] ? row[idCol] : `P${String(i).padStart(3, '0')}`;
    const area = areaCol >= 0 && row[areaCol] ? row[areaCol] : "ทั่วไป";
    const rawGender = genderCol >= 0 ? row[genderCol] : "หญิง";
    const gender: Gender = rawGender.includes("ชาย") || rawGender.toLowerCase() === "male" || rawGender.toLowerCase() === "m" ? "ชาย" : "หญิง";
    
    const age = ageCol >= 0 ? parseInt(row[ageCol], 10) || 45 : 45;
    const bmi = bmiCol >= 0 ? parseFloat(row[bmiCol]) || 23.5 : 23.5;
    const sbp = sbpCol >= 0 ? parseInt(row[sbpCol], 10) || 125 : 125;
    const glucose = glucoseCol >= 0 ? parseInt(row[glucoseCol], 10) || 100 : 100;
    const pulse = pulseCol >= 0 ? parseInt(row[pulseCol], 10) || 75 : 75;
    const checkDate = dateCol >= 0 && row[dateCol] ? row[dateCol] : "2024-03-01";

    let smoking: SmokingStatus = "ไม่สูบ";
    if (smokingCol >= 0 && row[smokingCol]) {
      const s = row[smokingCol];
      if (s.includes("ประจำ")) smoking = "สูบเป็นประจำ";
      else if (s.includes("ครั้งคราว")) smoking = "สูบเป็นครั้งคราว";
      else if (s.includes("เลิกแล้ว")) smoking = "เคยสูบแต่เลิกแล้ว";
      else if (s.includes("ไม่สูบ")) smoking = "ไม่สูบ";
      else smoking = s as SmokingStatus;
    }

    let alcohol: AlcoholStatus = "ไม่ดื่ม";
    if (alcoholCol >= 0 && row[alcoholCol]) {
      const a = row[alcoholCol];
      if (a.includes("ประจำ")) alcohol = "ดื่มเป็นประจำ";
      else if (a.includes("ครั้งคราว")) alcohol = "ดื่มเป็นครั้งคราว";
      else alcohol = "ไม่ดื่ม";
    }

    let exercise: ExerciseStatus = "1-2 วัน/สัปดาห์";
    if (exerciseCol >= 0 && row[exerciseCol]) {
      const e = row[exerciseCol];
      if (e.includes("ไม่") || e === "0") exercise = "ไม่ออกกำลังกาย";
      else if (e.includes("3") || e.includes("สม่ำเสมอ")) exercise = ">= 3 วัน/สัปดาห์";
      else exercise = "1-2 วัน/สัปดาห์";
    }

    let riskScore = riskScoreCol >= 0 ? parseInt(row[riskScoreCol], 10) : 0;
    if (isNaN(riskScore) || riskScore <= 0) {
      // Calculate sensible risk score if missing
      riskScore = 1;
      if (age >= 60) riskScore += 3;
      else if (age >= 45) riskScore += 2;
      if (bmi >= 28) riskScore += 3;
      else if (bmi >= 25) riskScore += 2;
      if (sbp >= 140) riskScore += 3;
      else if (sbp >= 120) riskScore += 1;
      if (glucose >= 126) riskScore += 3;
      else if (glucose >= 100) riskScore += 1;
      if (smoking === "สูบเป็นประจำ") riskScore += 2;
      if (exercise === "ไม่ออกกำลังกาย") riskScore += 1;
    }

    let riskLevel: RiskLevel = "เสี่ยงต่ำ";
    if (riskLevelCol >= 0 && row[riskLevelCol]) {
      const rl = row[riskLevelCol];
      if (rl.includes("สูง")) riskLevel = "เสี่ยงสูง";
      else if (rl.includes("กลาง")) riskLevel = "เสี่ยงปานกลาง";
      else riskLevel = "เสี่ยงต่ำ";
    } else {
      if (riskScore >= 8) riskLevel = "เสี่ยงสูง";
      else if (riskScore >= 5) riskLevel = "เสี่ยงปานกลาง";
      else riskLevel = "เสี่ยงต่ำ";
    }

    let diabetesScreening: ScreeningResult = "ปกติ";
    if (dmCol >= 0 && row[dmCol]) {
      const dm = row[dmCol];
      if (dm.includes("ป่วย")) diabetesScreening = "สงสัยป่วย";
      else if (dm.includes("เสี่ยง")) diabetesScreening = "กลุ่มเสี่ยง";
      else diabetesScreening = "ปกติ";
    } else {
      if (glucose >= 126) diabetesScreening = "สงสัยป่วย";
      else if (glucose >= 100) diabetesScreening = "กลุ่มเสี่ยง";
    }

    let hypertensionScreening: ScreeningResult = "ปกติ";
    if (htCol >= 0 && row[htCol]) {
      const ht = row[htCol];
      if (ht.includes("ป่วย")) hypertensionScreening = "สงสัยป่วย";
      else if (ht.includes("เสี่ยง")) hypertensionScreening = "กลุ่มเสี่ยง";
      else hypertensionScreening = "ปกติ";
    } else {
      if (sbp >= 140) hypertensionScreening = "สงสัยป่วย";
      else if (sbp >= 120) hypertensionScreening = "กลุ่มเสี่ยง";
    }

    records.push({
      id,
      area,
      gender,
      age,
      bmi,
      sbp,
      glucose,
      pulse,
      checkDate,
      smoking,
      alcohol,
      exercise,
      riskScore,
      riskLevel,
      diabetesScreening,
      hypertensionScreening,
    });
  }

  return records;
}

export interface SheetFetchResult {
  records: HealthRecord[];
  source: 'google_sheets_live' | 'default_dataset' | 'manual_csv';
  updatedAt: string;
  sheetId: string;
  statusMessage: string;
  isRestricted: boolean;
}

export async function fetchHealthRecordsFromSheet(sheetId: string = TARGET_SHEET_ID): Promise<SheetFetchResult> {
  const now = new Date();
  const formattedDate = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(now);

  // 1. Try to fetch directly from Google Sheet endpoints
  const endpoints = [
    `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`,
    `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'text/csv, text/plain, */*' } });
      if (res.ok) {
        const text = await res.text();
        // Check if response is actually Google login html
        if (text.includes("accounts.google.com") || text.includes("document-root") || text.includes("<html") || text.includes("Sign in to your Google Account")) {
          // Restricted by Google Sheet sharing permissions
          continue;
        }
        const records = parseCSVToHealthRecords(text);
        if (records.length > 0) {
          // Save to local storage for offline use
          try {
            localStorage.setItem('cached_live_sheet_records', JSON.stringify({ records, sheetId, updatedAt: formattedDate }));
          } catch {}

          return {
            records,
            source: 'google_sheets_live',
            updatedAt: formattedDate,
            sheetId,
            statusMessage: `เชื่อมโยง Google Sheet สำเร็จ (ดึงข้อมูลสด ${records.length} รายการ)`,
            isRestricted: false,
          };
        }
      }
    } catch {
      // Continue to next endpoint or fallback
    }
  }

  // 2. Check if user previously imported/cached custom records for this sheet
  try {
    const savedCustom = localStorage.getItem('user_imported_health_records');
    if (savedCustom) {
      const parsed = JSON.parse(savedCustom);
      if (parsed && Array.isArray(parsed.records) && parsed.records.length > 0) {
        return {
          records: parsed.records,
          source: 'manual_csv',
          updatedAt: parsed.updatedAt || formattedDate,
          sheetId,
          statusMessage: `ใช้ข้อมูลชีตที่นำเข้าไว้ล่าสุด (${parsed.records.length} รายการ)`,
          isRestricted: false,
        };
      }
    }
  } catch {}

  // 3. Fallback to complete authentic health screening dataset
  const defaultRecords = getInitialDataset();
  return {
    records: defaultRecords,
    source: 'default_dataset',
    updatedAt: formattedDate,
    sheetId,
    statusMessage: `พร้อมใช้งาน: ใช้ชุดข้อมูลการคัดกรองสุขภาพมาตรฐาน (${defaultRecords.length} รายการ) เนื่องจาก Google Sheet ติดสิทธิ์การเข้าถึง`,
    isRestricted: true,
  };
}
