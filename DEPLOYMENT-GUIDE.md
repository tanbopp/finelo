# 📋 Panduan Deployment Google Apps Script untuk Fitur Investasi

## 🎯 Overview
Panduan ini akan membantu Anda mengaktifkan fitur **Investasi** dengan real-time stock price checking menggunakan Google Apps Script dan GOOGLEFINANCE API.

⚠️ **PENTING**: Aplikasi saat ini berjalan dalam **Mode Demo** dengan data sampel. Ikuti panduan ini untuk mengaktifkan data real-time.

## 🔧 Mode Demo vs Mode Real

### Mode Demo (Aktif sekarang)
- ✅ Langsung bisa digunakan tanpa setup
- ✅ Data sampel untuk 10+ saham populer  
- ✅ Simulasi loading dan error handling
- ⚠️ Data tidak real-time (hanya untuk testing)

### Mode Real (Perlu setup)
- 🚀 Data real-time dari Google Finance
- 🚀 Support ribuan saham global
- 🚀 Update harga otomatis
- ⚙️ Perlu deployment Google Apps Script

## 📋 Prerequisites
- Akun Google (Gmail)
- Akses ke Google Apps Script (script.google.com)
- File `google-apps-script.js` dari project ini

## 🚀 Langkah-langkah Deployment

### 1. Buka Google Apps Script
1. Kunjungi [script.google.com](https://script.google.com)
2. Login dengan akun Google Anda
3. Klik **"New Project"** (Proyek Baru)

### 2. Setup Script
1. Hapus kode default yang ada
2. Copy seluruh kode dari file `google-apps-script.js`
3. Paste ke dalam editor Google Apps Script
4. Klik **Save** (Ctrl+S) dan beri nama project: `"Stock Price API"`

### 3. Deploy as Web App
1. Klik **Deploy** > **New deployment**
2. Klik ⚙️ (gear icon) next to "Type"
3. Pilih **"Web app"**
4. Isi pengaturan sebagai berikut:
   - **Description**: `Stock Price API for Money Tracker`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
5. Klik **Deploy**
6. **Authorize** aplikasi jika diminta
7. **Copy Web app URL** yang diberikan

### 4. Update Konfigurasi di Website
1. Buka file `script.js`
2. Temukan baris:
   ```javascript
   const STOCK_API_CONFIG = {
       baseUrl: 'https://script.google.com/macros/s/AKfycbxABC123def456ghi789jkl012mno345pqr678stu901vwx234yz567ab890cd12ef34gh56ij78kl90mn/exec',
   ```
3. **Ganti URL** dengan Web app URL yang Anda copy dari step 3.7
4. Save file `script.js`

### 5. Testing
1. Buka website money tracker Anda
2. Navigasi ke menu **"Investasi"**
3. Test dengan stock codes berikut:
   - Indonesian stocks: `IDX:BBCA`, `IDX:BMRI`, `IDX:TLKM`
   - US stocks: `NASDAQ:AAPL`, `NASDAQ:GOOGL`, `NYSE:TSLA`

## 📊 Supported Stock Formats

### Indonesian Stocks (IDX)
```
IDX:BBCA  - Bank Central Asia
IDX:BMRI  - Bank Mandiri
IDX:TLKM  - Telkom Indonesia
IDX:UNVR  - Unilever Indonesia
IDX:ASII  - Astra International
```

### US Stocks
```
NASDAQ:AAPL   - Apple Inc
NASDAQ:GOOGL  - Alphabet Inc
NASDAQ:MSFT   - Microsoft
NYSE:TSLA     - Tesla Inc
NYSE:DIS      - Disney
```

### Global Markets
```
LON:VOD     - Vodafone (London)
TYO:7203    - Toyota (Tokyo)
FRA:SAP     - SAP (Frankfurt)
```

## 🔧 Troubleshooting

### Error: "Script tidak dapat diakses"
**Solusi:**
1. Pastikan deployment setting "Who has access" = `Anyone`
2. Re-deploy dengan deployment baru
3. Update URL di `script.js`

### Error: "CORS Policy"
**Solusi:**
Script sudah include CORS headers. Jika masih error:
1. Check browser console untuk detail error
2. Pastikan URL sudah benar di `STOCK_API_CONFIG`

### Error: "Stock code tidak valid"
**Solusi:**
1. Gunakan format: `EXCHANGE:SYMBOL`
2. Contoh yang benar: `IDX:BBCA`, `NASDAQ:AAPL`
3. Pastikan stock code benar dan tersedia di Google Finance

### Error: "Timeout"
**Solusi:**
1. Google Apps Script kadang lambat (normal)
2. Script sudah include 30 detik timeout
3. Coba refresh dan search ulang

### Error: "Data tidak tersedia"
**Solusi:**
1. Stock mungkin tidak tersedia di Google Finance
2. Coba stock lain atau check di Google Finance web
3. Pastikan market sedang buka (jam trading)

## 🔄 Update Script
Jika perlu update script:
1. Edit kode di Google Apps Script
2. Save perubahan
3. **Deploy** > **Manage deployments**
4. Klik ✏️ (edit icon) pada deployment aktif
5. Pilih **New version**
6. Klik **Deploy**

## 📱 Mobile Testing
1. Test di mobile browser
2. Pastikan responsive design berfungsi
3. Test semua button popular stocks

## 🎉 Selesai!
Fitur Investasi dengan real-time stock price checking sekarang sudah aktif!

### Features yang Tersedia:
- ✅ Real-time stock price checking
- ✅ Popular stocks quick access
- ✅ Investment calculator with broker fees
- ✅ Recent searches history
- ✅ Multi-currency support (IDR/USD)
- ✅ Error handling dan loading states

---

💡 **Tips:** Bookmark deployment URL untuk update mudah di masa depan!

🆘 **Need Help?** Check Google Apps Script documentation atau tanyakan di forum Google Apps Script.
