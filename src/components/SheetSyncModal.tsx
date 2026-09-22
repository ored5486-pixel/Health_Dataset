import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, Upload, Check, AlertCircle, FileText } from 'lucide-react';
import { SheetFetchResult, parseCSVToHealthRecords } from '../services/sheetService';
import { HealthRecord } from '../types';

interface SheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSheetId: string;
  sheetStatus: SheetFetchResult | null;
  onUpdateSheetId: (newId: string) => void;
  onImportCustomRecords: (records: HealthRecord[], sourceLabel: string) => void;
  isSyncing: boolean;
}

export const SheetSyncModal: React.FC<SheetSyncModalProps> = ({
  isOpen,
  onClose,
  currentSheetId,
  sheetStatus,
  onUpdateSheetId,
  onImportCustomRecords,
  isSyncing,
}) => {
  const [inputSheetId, setInputSheetId] = useState(currentSheetId);
  const [pastedCSV, setPastedCSV] = useState('');
  const [csvError, setCsvError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleApplySheetId = () => {
    if (inputSheetId.trim()) {
      onUpdateSheetId(inputSheetId.trim());
      setSuccessMsg('กำลังเชื่อมโยง Google Sheet ID ใหม่...');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const records = parseCSVToHealthRecords(text);
        if (records.length === 0) {
          setCsvError('ไม่พบข้อมูลที่ถูกต้องในไฟล์ CSV');
          return;
        }
        onImportCustomRecords(records, `ไฟล์ CSV: ${file.name}`);
        setCsvError('');
        setSuccessMsg(`นำเข้าข้อมูลจาก ${file.name} สำเร็จ (${records.length} รายการ)`);
        setTimeout(() => {
          onClose();
        }, 1200);
      } catch {
        setCsvError('เกิดข้อผิดพลาดในการอ่านไฟล์ CSV');
      }
    };
    reader.readAsText(file);
  };

  const handleParsePastedCSV = () => {
    if (!pastedCSV.trim()) {
      setCsvError('กรุณาวางข้อความรูปแบบ CSV');
      return;
    }
    const records = parseCSVToHealthRecords(pastedCSV);
    if (records.length === 0) {
      setCsvError('ไม่สามารถแปลงข้อมูล CSV ได้ กรุณาตรวจสอบรูปแบบหัวตาราง');
      return;
    }
    onImportCustomRecords(records, 'ข้อความ CSV ที่นำเข้า');
    setCsvError('');
    setSuccessMsg(`นำเข้าสำเร็จ (${records.length} รายการ)`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">การเชื่อมโยง Google Sheets & แหล่งข้อมูล</h3>
              <p className="text-xs text-pink-100">
                จัดการ Sheet ID: {currentSheetId}
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Alert */}
          {sheetStatus && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                sheetStatus.isRestricted
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {sheetStatus.isRestricted ? (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold">
                  {sheetStatus.isRestricted
                    ? 'สถานะ: ใช้ชุดข้อมูลการคัดกรองสุขภาพที่เตรียมไว้ (Fallback Mode)'
                    : 'สถานะ: ซิงค์สดจาก Google Sheets เรียบร้อยแล้ว'}
                </div>
                <div className="text-[11px] leading-relaxed opacity-90">
                  {sheetStatus.statusMessage}
                </div>
                {sheetStatus.isRestricted && (
                  <div className="pt-2 text-[11px] text-amber-800">
                    💡 <em>คำแนะนำ:</em> เพื่อให้ดึงข้อมูลสดจาก Google Sheet ได้โดยตรง กรุณาเปิดไฟล์ Sheet แล้วคลิก <strong>Share (แชร์) &rarr; General access: Anyone with the link (ทุกคนที่มีลิงก์)</strong> แล้วกด "ซิงค์ข้อมูลใหม่"
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {successMsg}
            </div>
          )}

          {csvError && (
            <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              {csvError}
            </div>
          )}

          {/* 1. Google Sheet ID Configuration */}
          <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Google Sheet ID ที่กำหนด</label>
              <a
                href={`https://docs.google.com/spreadsheets/d/${currentSheetId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1"
              >
                <span>เปิดดู Google Sheet ในแท็บใหม่</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputSheetId}
                onChange={(e) => setInputSheetId(e.target.value)}
                placeholder="ระบุ Google Sheet ID"
                className="flex-1 text-xs font-mono bg-white border border-pink-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                onClick={handleApplySheetId}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>ซิงค์</span>
              </button>
            </div>
          </div>

          {/* 2. File Upload Option */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-pink-600" />
              <span>หรือ อัปโหลดไฟล์ CSV จากเครื่อง (Direct CSV Import)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              หากต้องการนำเข้าไฟล์ CSV ผลการคัดกรองสุขภาพที่ดาวน์โหลดมาจาก Google Sheet
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
            />
          </div>

          {/* 3. Paste CSV or Copied Cells from Sheet */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-pink-600" />
              <span>หรือ คัดลอกตารางจาก Google Sheets มาวางที่นี่ (Direct Copy & Paste)</span>
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              เปิด Google Sheet แล้วกดเลือกข้อมูล (Ctrl+A หรือคลุมตารางทั้ง 30 คน) แล้วกด <strong>คัดลอก (Ctrl+C)</strong> นำมาวางในช่องนี้ได้ทันที ระบบรองรับทั้งรูปแบบ Tab และ CSV
            </p>
            <textarea
              rows={4}
              value={pastedCSV}
              onChange={(e) => setPastedCSV(e.target.value)}
              placeholder="รหัสบุคคล	พื้นที่	เพศ	อายุ	BMI	SBP	น้ำตาล_mg_dL	ชีพจร_bpm ... (วางที่นี่)"
              className="w-full text-xs font-mono bg-white border border-slate-200 rounded-xl p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={handleParsePastedCSV}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition"
            >
              ประมวลผลข้อความ CSV
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
