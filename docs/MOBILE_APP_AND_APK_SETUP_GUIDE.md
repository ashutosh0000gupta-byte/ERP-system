# SNMR ERP — Android Mobile App & APK Guide 📱

Yeh guide aapko batati hai ki kaise aap **SNMR ERP** ka **Android Mobile App** use kar sakte hain aur **APK** generate karke apne phone par bina laptop/system khole daily site ke kharch, hajiri aur advance darj kar sakte hain.

---

## 🌟 Mobile App me Kya-Kya Features Hain:

1. **🏠 Aaj Ka Khata (Today's Dashboard)**:
   - Aaj ka total kharcha kitna hua (₹).
   - Aaj kitne workers present hain.
   - Aaj kitna advance diya gaya.
   - Aaj ke total overtime (OT) hours.
   - Quick action shortcuts (Naya Kharch, Hajiri, Advance, Naya Worker).

2. **💸 Daily Kharch (Site Expense Entry)**:
   - Site select karein.
   - Category chunein (Material, Diesel/Gaadi, Khana/Chai, Petty Cash, Tools, Labour).
   - Amount dalein (Quick chips: +100, +500, +2000, +5000).
   - **📷 Bill Photo Capture**: Phone camera se bill/receipt ki photo kheenchkar attach karein.
   - 1-Click "Save Kharcha".

3. **📋 Site Hajiri & OT (Attendance)**:
   - Tarikh aur site chunein.
   - **Sabhi Present**: 1-click me saare workers ko Present mark karne ka feature.
   - Worker-wise 1-tap buttons: **P (Present)**, **HD (Half Day)**, **A (Absent)**.
   - Overtime Counter: `+` aur `-` dabakar OT hours set karein.
   - Real-time auto save.

4. **💳 Worker Advance Entry**:
   - Worker select karein.
   - Advance amount dalein.
   - Karan (Reason) dalein (e.g. Ghar bhejna, medical, tyohar).
   - Advance save karein (automatically monthly salary se deduct hone ke liye sync ho jata hai).

5. **👷 Workers Directory & Onboarding**:
   - Site ke saare workers ki list aur unki daily wage.
   - **Direct Call Button**: Click karte hi worker ko phone lag jata hai.
   - **Direct WhatsApp Button**: Click karte hi worker ke number par WhatsApp chat khul jati hai.
   - **+ Naya Worker Jodein**: Site par aate hi naye labor/mistry ka naam, trade aur rate mobile se hi register karein.

---

## 🚀 App Use Karne Ke 2 Aasan Tarike:

---

### Tarika 1: Instant PWA Install (Phone par bina kisi software ke turant install karein) ⚡

1. Apne phone ke Chrome browser me ERP open karein:
   ```text
   http://<AAPKA-IP-ADDRESS>:5173/mobile
   ```
2. Chrome browser me upar 3 dots (`⋮`) par click karein.
3. **"Install App"** ya **"Add to Home screen"** (होम स्क्रीन में जोड़ें) par tap karein.
4. Aapke mobile ke home screen par **SNMR ERP** ka app icon ban jayega.
5. Ab jab bhi icon par tap karenge, wo poora full-screen Android app ki tarah khulega (bina kisi browser bar ke).

---

### Tarika 2: Native Android APK Build Karna (`.apk` File) 📦

Project me **Capacitor Android Native Studio** setup complete kar diya gaya hai (`frontend/android` folder).

#### APK Build Karne Ke Steps:

1. **Android Studio** open karein.
2. **Open Existing Project** par click karein aur yeh folder select karein:
   ```text
   enterprise-hrms-main\frontend\android
   ```
3. Upar menu me jaayein:
   ```text
   Build ➔ Build Bundle(s) / APK(s) ➔ Build APK(s)
   ```
4. 1-2 minute me APK generate ho jayegi:
   ```text
   frontend/android/app/build/outputs/apk/debug/app-debug.apk
   ```
5. Yeh `app-debug.apk` file WhatsApp ya cable ke through kisi bhi phone me bhejiye aur tap karke **Install** kar lijiye!

#### Command-Line se APK Build Karna:
Agar aapke system par Java/Android SDK installed hai, toh terminal me:
```bash
cd frontend/android
./gradlew assembleDebug
```

---

## 🔄 Real-Time Database Sync

Mobile app me jo bhi kharch ya hajiri dali jayegi:
- Wo turant backend database me save hogi.
- Desktop/laptop par jab bhi aap **Salary**, **Worker Attendance**, **Site Expenses**, ya **Reports** kholenge, wo sara data pehle se updated milega!
