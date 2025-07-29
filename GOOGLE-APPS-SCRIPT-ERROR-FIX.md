# 🔧 Google Apps Script Error Fix

## ❌ **Error yang Anda Alami:**

```
Error in doGet: [TypeError: Cannot read properties of undefined (reading 'parameter')]
TypeError: ContentService.createTextOutput(...).setMimeType(...).setHeaders is not a function
```

## 🚨 **Penyebab Error:**

### **1. Parameter Error**
- **Issue**: `e.parameter` bisa undefined jika tidak ada parameter
- **Fix**: Added null checking dan default values

### **2. ContentService Method Chaining Error**  
- **Issue**: `setHeaders()` tidak tersedia atau method chaining gagal
- **Fix**: Separate method calls dan error handling

### **3. setMimeType Error**
- **Issue**: Kadang `setMimeType()` gagal di Google Apps Script
- **Fix**: Try-catch wrapper dengan fallback

## ✅ **Solusi yang Diberikan:**

### **File: `google-apps-script-fixed.js`** 
Ini adalah versi yang **sudah diperbaiki** dengan:

1. **Robust Parameter Handling**
```javascript
let kode = 'IDX:BBCA'; // default
if (e && e.parameter && e.parameter.kode) {
    kode = e.parameter.kode.trim().toUpperCase();
}
```

2. **Safe ContentService Usage**
```javascript
function createResponse(data) {
  try {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    
    // Safe MIME type setting
    try {
      output.setMimeType(ContentService.MimeType.JSON);
    } catch (mimeError) {
      console.log('MIME type error (non-critical):', mimeError);
    }
    
    return output;
  } catch (error) {
    // Fallback response
    return ContentService.createTextOutput(
      JSON.stringify({success: false, error: error.toString()})
    );
  }
}
```

3. **Simplified GOOGLEFINANCE Usage**
```javascript
// Lebih reliable tanpa parameter "price"
sheet.getRange('A1').setFormula(`=GOOGLEFINANCE("${kode}")`);
```

4. **Better Error Handling**
```javascript
try {
  // Main logic
} catch (error) {
  console.error('Error:', error);
  return createResponse({
    success: false,
    error: 'Server error: ' + error.toString()
  });
} finally {
  // Cleanup spreadsheet
}
```

## 🚀 **Cara Deploy Ulang:**

### **Step 1: Copy Code Baru**
1. Buka Google Apps Script di browser
2. **Replace semua code** dengan isi file `google-apps-script-fixed.js`
3. Save (Ctrl+S)

### **Step 2: Test Function**
```javascript
// Jalankan fungsi test di Apps Script editor
testDoGet(); // Test basic functionality
testStockPrice(); // Test stock price retrieval
```

### **Step 3: Deploy Ulang**
1. Klik **"Deploy"** → **"New deployment"**
2. Type: **"Web app"**
3. Execute as: **"Me"**
4. Who has access: **"Anyone"**
5. Klik **"Deploy"**
6. Copy **URL baru** yang berakhiran `/exec`

### **Step 4: Update di Money Tracker**
Update URL di `script.js`:
```javascript
const STOCK_API_CONFIG = {
    baseUrl: 'https://script.google.com/macros/s/AKfycbypME8VADy5niE7OsCekT0G18RWVUzCCgL2uf5kS6rDWjTDrEBcA5KjY1v0WfDi7Z1_2w/exec',
    // ... rest of config
};
```

## 🧪 **Test URLs:**

### **Test URL 1: Basic Test**
```
https://script.google.com/macros/s/AKfycbypME8VADy5niE7OsCekT0G18RWVUzCCgL2uf5kS6rDWjTDrEBcA5KjY1v0WfDi7Z1_2w/exec?kode=IDX:BBCA
```
**Expected Response:**
```json
{
  "success": true,
  "kode": "IDX:BBCA",
  "harga": 9775,
  "timestamp": "2025-07-29T12:17:47.000Z",
  "currency": "IDR"
}
```

### **Test URL 2: US Stock**
```
https://script.google.com/macros/s/AKfycbypME8VADy5niE7OsCekT0G18RWVUzCCgL2uf5kS6rDWjTDrEBcA5KjY1v0WfDi7Z1_2w/exec?kode=NASDAQ:AAPL
```

### **Test URL 3: Error Case**
```
https://script.google.com/macros/s/AKfycbypME8VADy5niE7OsCekT0G18RWVUzCCgL2uf5kS6rDWjTDrEBcA5KjY1v0WfDi7Z1_2w/exec?kode=INVALID:TEST
```
**Expected Response:**
```json
{
  "success": false,
  "error": "Data untuk kode \"INVALID:TEST\" tidak ditemukan atau tidak tersedia"
}
```

## 📋 **Checklist Troubleshooting:**

### ✅ **Before Deploy:**
- [ ] Code sudah di-copy dari `google-apps-script-fixed.js`
- [ ] Saved di Google Apps Script editor
- [ ] Test function `testDoGet()` berhasil
- [ ] No syntax errors di editor

### ✅ **After Deploy:**
- [ ] URL deployment berakhiran `/exec` (bukan `/dev`)
- [ ] Test URL di browser mengembalikan JSON valid
- [ ] Response format sesuai expected
- [ ] CORS headers berfungsi (tidak ada CORS error)

### ✅ **Integration Test:**
- [ ] URL sudah di-update di `STOCK_API_CONFIG`
- [ ] Money tracker app bisa connect ke Google Apps Script
- [ ] Real-time mode berfungsi tanpa error
- [ ] Fallback ke demo mode tetap bekerja

## 🎯 **Expected Behavior After Fix:**

### **Real-time Mode:**
1. **Input**: IDX:CUAN
2. **Process**: Call Google Apps Script → Get real price atau fallback ke demo
3. **Result**: ✅ Menampilkan harga tanpa error

### **Error Handling:**
1. **Network error**: Auto-fallback ke demo data
2. **Invalid stock**: Clear error message
3. **API timeout**: Graceful failure dengan notification

### **Performance:**
1. **Response time**: 2-4 seconds (normal untuk Google Finance)
2. **Success rate**: High reliability dengan fallback
3. **User experience**: Seamless switching antara real-time dan demo

## 🔍 **Debug Tips:**

### **Check Execution Log:**
1. Di Google Apps Script editor
2. Klik **"Executions"** di sidebar
3. Lihat log untuk error details

### **Console Debugging:**
```javascript
// Add ke money tracker browser console
console.log('Testing API:', STOCK_API_CONFIG.baseUrl);
fetch(STOCK_API_CONFIG.baseUrl + '?kode=IDX:BBCA')
  .then(r => r.json())
  .then(data => console.log('API Response:', data));
```

### **Manual Test:**
```javascript
// Di Google Apps Script editor
function manualTest() {
  const result = doGet({parameter: {kode: 'IDX:BBCA'}});
  console.log(result.getContent());
}
```

---

## 🎉 **Summary:**

**Error disebabkan oleh:**
1. ❌ Parameter handling yang tidak robust
2. ❌ ContentService method chaining error  
3. ❌ setMimeType() compatibility issue

**Fixed dengan:**
1. ✅ Robust null checking dan default values
2. ✅ Separate method calls dengan try-catch
3. ✅ Fallback response mechanism
4. ✅ Simplified GOOGLEFINANCE usage

**Use file `google-apps-script-fixed.js` untuk deployment baru!** 🚀
