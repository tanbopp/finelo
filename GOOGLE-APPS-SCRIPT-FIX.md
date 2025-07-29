# 🚨 Masalah Google Apps Script URL Development

## ❌ **Masalah yang Ditemukan**

URL Google Apps Script Anda saat ini berakhiran `/dev` yang merupakan URL development, bukan production URL yang diperlukan untuk akses eksternal.

**URL Saat Ini:**
```
https://script.google.com/macros/s/AKfycbxsrszRsyhztgRgBzs0NZo_Onq-FpXfrox6WdQvifk3/dev
```

## ✅ **Solusi Langkah Demi Langkah**

### **1. Buka Google Apps Script**
- Kunjungi [script.google.com](https://script.google.com)
- Buka project yang sudah Anda buat

### **2. Deploy Sebagai Web App (Bukan Test)**
1. Klik **Deploy** (bukan "Test")
2. Pilih **"New deployment"** 
3. Klik ⚙️ (gear icon) next to "Type"
4. Pilih **"Web app"**
5. **PENTING**: Pengaturan deployment:
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone`
6. Klik **Deploy** (bukan Test)
7. **Copy URL Web app** yang BERAKHIRAN `/exec`

### **3. Update URL di Aplikasi**

**URL yang BENAR harus seperti ini:**
```
https://script.google.com/macros/s/AKfycbxsrszRsyhztgRgBzs0NZo_Onq-FpXfrox6WdQvifk3/exec
```

Ganti URL di file `script.js` pada bagian:
```javascript
const STOCK_API_CONFIG = {
    baseUrl: 'https://script.google.com/macros/s/AKfycbxsrszRsyhztgRgBzs0NZo_Onq-FpXfrox6WdQvifk3/exec', // URL yang BENAR
    timeout: 30000,
    demoMode: false // Set ke false untuk menggunakan data real
};
```

## 🔍 **Perbedaan URL**

| Type | URL | Akses | Untuk |
|------|-----|-------|-------|
| **Development** | `/dev` | Hanya editor script | Testing di Apps Script |
| **Production** | `/exec` | Public access | Website eksternal |

## 🛠️ **Troubleshooting**

### **Jika masih error 404/403:**
1. Pastikan script sudah di-deploy sebagai Web App (bukan test)
2. Pastikan "Who has access" = `Anyone` 
3. Pastikan menggunakan URL yang berakhiran `/exec`
4. Tunggu 1-2 menit setelah deployment

### **Jika tidak mau deploy:**
- Coba logout/login ulang ke Google Account
- Refresh halaman Google Apps Script
- Coba deploy ulang

## 📝 **Langkah Cepat**

1. **Buka Google Apps Script** → Pilih project Anda
2. **Deploy** → **New deployment** 
3. **Type**: Web app
4. **Execute as**: Me
5. **Access**: Anyone  
6. **Deploy** → Copy URL `/exec`
7. **Paste** URL di `script.js`
8. **Set** `demoMode: false`
9. **Test** di website

## 💡 **Alternatif: Tetap Gunakan Mode Demo**

Jika Google Apps Script terlalu ribet, Anda bisa tetap menggunakan mode demo yang sudah berfungsi dengan sempurna:

1. Biarkan `demoMode: true`
2. Aktifkan toggle "Mode Demo" di website
3. Fitur investasi tetap bisa digunakan dengan data sampel

---

**Need Help?** Error ini umum terjadi karena perbedaan URL development vs production di Google Apps Script. Pastikan menggunakan URL production yang berakhiran `/exec`!
