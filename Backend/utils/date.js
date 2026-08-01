// =============================================
// Helper tanggal & jam WIB (Asia/Jakarta, UTC+7)
// Dipakai buat absensi & streak biar konsisten sama
// pola yang udah dipakai di route/dashboard.js
// =============================================

// Ambil "sekarang" dalam bentuk Date yang kalau dibaca pakai method UTC-nya
// (getUTCFullYear, getUTCDay, dst) hasilnya udah sesuai jam WIB.
function getNowWIB() {
    return new Date(Date.now() + 7 * 60 * 60 * 1000);
}

// Ubah Date (hasil getNowWIB) jadi string "YYYY-MM-DD"
function toDateStr(dateWIB) {
    return dateWIB.toISOString().split("T")[0];
}

// Cek apakah Date (hasil getNowWIB) jatuh di hari Sabtu/Minggu
function isWeekendWIB(dateWIB) {
    const day = dateWIB.getUTCDay(); // 0 = Minggu, 6 = Sabtu
    return day === 0 || day === 6;
}

// Cari hari sekolah (bukan weekend) sebelum tanggal yang dikasih.
// Ini yang bikin streak GA reset kalau siswa gak absen pas Sabtu/Minggu,
// karena "hari sebelumnya" yang dicek otomatis loncat lewatin weekend.
// Contoh: sekarang Senin -> balik ke Jumat (loncatin Sabtu & Minggu).
function getPreviousSchoolDayWIB(dateWIB) {
    const d = new Date(dateWIB.getTime());
    do {
        d.setUTCDate(d.getUTCDate() - 1);
    } while (isWeekendWIB(d));
    return toDateStr(d);
}

module.exports = { getNowWIB, toDateStr, isWeekendWIB, getPreviousSchoolDayWIB };