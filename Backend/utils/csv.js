// =============================================
// Helper bikin & kirim file CSV.
//
// Kenapa CSV, bukan .xlsx?
// File .xlsx itu sebenarnya berupa arsip ZIP biner — kalau di komputer
// user gak ada aplikasi spreadsheet yang ke-assign buat buka .xlsx,
// OS-nya bakal coba buka pakai text editor (WordPad/Notepad) dan hasilnya
// keliatan kayak teks acak/rusak, padahal isi filenya sebenarnya valid.
// CSV itu teks polos biasa, jadi otomatis kebuka rapi di Excel, WPS,
// LibreOffice, Google Sheets (tinggal import), bahkan Notepad sekalipun —
// gak bergantung ada-gaknya aplikasi spreadsheet tertentu.
// =============================================

// Escape 1 nilai sel biar aman dari koma/petik/baris baru
function escapeCsvField(value) {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

// rows: array of array (baris pertama = header)
function toCsv(rows) {
    return rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");
}

// Kirim CSV sebagai file download. BOM (\uFEFF) di depan biar Excel
// otomatis kebaca UTF-8 dengan benar (karakter kayak "é", emoji, dst).
function sendCsv(res, filename, rows) {
    const csv = "\uFEFF" + toCsv(rows);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
}

module.exports = { toCsv, sendCsv };