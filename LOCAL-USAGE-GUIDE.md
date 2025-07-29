# 🖥️ Local Usage Guide - Money Tracker

## ✅ **Ya, Anda DAPAT Menggunakan Aplikasi Ini Secara Lokal!**

Aplikasi Money Tracker dirancang untuk berjalan **100% offline** di komputer Anda tanpa perlu koneksi internet untuk fitur-fitur utama.

## 🚀 **Cara Menjalankan Secara Lokal**

### **Method 1: Direct Browser (Paling Mudah)**
```bash
1. Buka Windows Explorer
2. Navigate ke folder: d:\Website\money-tracker-main
3. Double-click file "index.html"
4. Aplikasi akan terbuka di browser default Anda
```

### **Method 2: Drag & Drop**
```bash
1. Buka browser (Chrome, Firefox, Edge, dll)
2. Drag file "index.html" ke browser window
3. Drop dan aplikasi akan langsung berjalan
```

### **Method 3: Local Server (Recommended untuk Development)**

**Menggunakan Python (jika sudah terinstall):**
```powershell
# Buka PowerShell di folder aplikasi
cd "d:\Website\money-tracker-main"

# Python 3
python -m http.server 8000

# Atau Python 2
python -m SimpleHTTPServer 8000

# Akses via browser: http://localhost:8000
```

**Menggunakan Node.js:**
```powershell
# Install http-server secara global
npm install -g http-server

# Navigate ke folder
cd "d:\Website\money-tracker-main"

# Jalankan server
http-server

# Akses via browser: http://localhost:8080
```

**Menggunakan VS Code Live Server:**
```bash
1. Buka VS Code
2. Install extension "Live Server" 
3. Klik kanan pada index.html
4. Pilih "Open with Live Server"
5. Aplikasi akan terbuka di browser dengan auto-reload
```

## 📊 **Fitur yang Tersedia Offline vs Online**

| Fitur | Offline (Lokal) | Online | Keterangan |
|-------|-----------------|---------|------------|
| **💰 Money Tracking** | ✅ Full | ✅ Full | Semua fungsi tersedia |
| **📈 Statistics & Charts** | ✅ Full | ✅ Full | Chart.js tidak perlu internet |
| **📋 Categories & Goals** | ✅ Full | ✅ Full | Data disimpan di localStorage |
| **💼 Wallets & Transfer** | ✅ Full | ✅ Full | UI dan logic berjalan offline |
| **🔧 Settings** | ✅ Full | ✅ Full | Semua pengaturan tersimpan lokal |
| **📊 Excel Export** | ✅ Full | ✅ Full | XLSX.js bekerja offline |
| **🤖 AI Financial Consultant** | ✅ Full | ✅ Full | Logic AI berjalan di browser |
| **📈 Investment Demo Mode** | ✅ Full | ✅ Full | Sample data tersedia offline |
| **🔄 Investment Real-time** | ❌ Tidak | ✅ Ya | Perlu koneksi internet |

## 🔧 **Auto-Detection untuk Mode Lokal**

Aplikasi akan **otomatis mendeteksi** jika dijalankan secara lokal:

```javascript
// Auto-switch ke demo mode jika file:// protocol
if (window.location.protocol === 'file:') {
    // Otomatis aktifkan demo mode
    demoMode = true;
}
```

### **Indikator Mode Lokal:**
- URL di browser menunjukkan `file:///d:/Website/money-tracker-main/index.html`
- Toggle "Mode Demo" otomatis **ON** 
- Banner "Demo Mode" muncul di bagian investment
- Semua fitur investment menggunakan sample data

## 💾 **Data Storage Lokal**

### **Dimana Data Disimpan:**
- **Browser localStorage**: `C:\Users\[Username]\AppData\Local\[Browser]\User Data\Default\Local Storage`
- **Data persisten** antar session browser
- **Tidak hilang** saat restart komputer
- **Backup manual** bisa dilakukan via Export Excel

### **Data yang Tersimpan:**
```json
{
  "transactions": "Semua transaksi income/expense",
  "goals": "Target-target savings",
  "savings": "Data tabungan",
  "settings": "Pengaturan aplikasi",
  "categories": "Kategori custom",
  "wallets": "Data multiple wallets"
}
```

## 🔒 **Keamanan & Privacy**

### **Offline Benefits:**
- ✅ **100% Private**: Data tidak dikirim ke server manapun
- ✅ **No Tracking**: Tidak ada analytics atau tracking
- ✅ **Local Only**: Semua data tersimpan di komputer Anda
- ✅ **No Registration**: Tidak perlu akun atau login
- ✅ **Open Source**: Kode bisa diaudit dan dimodifikasi

### **Data Control:**
- **Export anytime**: Backup data via Excel export
- **Clear data**: Hapus semua data via Settings
- **Portable**: Copy folder ke komputer lain dan langsung jalan

## ⚡ **Performance Lokal**

### **Kelebihan Mode Lokal:**
- **Super Fast**: Tidak ada network latency
- **Instant Load**: Semua assets lokal
- **Offline Ready**: Bekerja tanpa internet
- **No Bandwidth**: Tidak menggunakan kuota internet
- **Stable**: Tidak tergantung koneksi server

### **File Size Overview:**
```
Total Size: ~2-3 MB
├── index.html: ~15 KB (Main interface)
├── script.js: ~150 KB (All functionality)
├── styles.css: ~20 KB (Styling)
├── Chart.js: ~200 KB (Charts library)
├── XLSX.js: ~500 KB (Excel export)
└── Documentation: ~1-2 MB (Guides & README)
```

## 🎯 **Recommended Local Workflow**

### **Setup Satu Kali:**
1. Copy folder `money-tracker-main` ke lokasi permanen
2. Buat shortcut `index.html` di desktop
3. Set browser default untuk file .html

### **Daily Usage:**
1. Double-click shortcut desktop
2. Mulai input transaksi
3. Monitor statistics real-time
4. Export backup bulanan ke Excel

### **Advanced Usage:**
1. Setup local server untuk development
2. Customize features sesuai kebutuhan
3. Backup folder secara berkala
4. Sync dengan cloud storage jika perlu

## 🔧 **Troubleshooting Lokal**

### **File tidak terbuka di browser:**
```bash
# Pastikan file association correct
1. Klik kanan index.html
2. "Open with" > pilih browser
3. Centang "Always use this app"
```

### **Chart tidak muncul:**
```bash
# Browser security restrictions
1. Gunakan local server (Method 3)
2. Atau akses via http:// bukan file://
```

### **Data hilang:**
```bash
# localStorage browser berbeda
1. Pastikan selalu buka di browser yang sama
2. Jangan clear browser data/cache
3. Backup regular via Export Excel
```

## 🎉 **Quick Start Lokal**

```bash
# Langkah Super Cepat:
1. Buka d:\Website\money-tracker-main\index.html
2. Tambah transaksi pertama
3. Lihat chart otomatis muncul
4. Set daily limit di Settings
5. Explore fitur Investment demo mode
6. Export data ke Excel

# Selesai! Aplikasi siap digunakan offline! 🚀
```

## 💡 **Tips & Tricks Lokal**

### **Backup Strategy:**
- **Daily**: Auto-backup via browser localStorage
- **Weekly**: Export Excel manually  
- **Monthly**: Copy seluruh folder ke backup location
- **Before update**: Backup data sebelum update aplikasi

### **Performance Tips:**
- Gunakan local server untuk performa terbaik
- Clear browser cache jika ada masalah
- Restart browser jika memory usage tinggi
- Close tab lain untuk performance optimal

### **Multi-Device:**
- Copy folder ke USB untuk portable usage
- Sync folder via Google Drive/OneDrive
- Export/Import Excel untuk transfer data
- Gunakan browser yang sama untuk consistency

---

## ✅ **Kesimpulan**

**Money Tracker 100% bisa digunakan secara lokal!** 

Semua fitur utama (tracking, statistics, export, AI consultant) bekerja sempurna offline. Hanya fitur real-time stock prices yang perlu internet, dan itu pun ada mode demo yang berfungsi offline.

**Mulai sekarang dan nikmati privacy + performance maksimal! 🖥️💰**
