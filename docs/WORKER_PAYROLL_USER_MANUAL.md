# SNMR Enterprise HRMS - Worker Wages & Payroll User Manual
*(कर्मचारी वेतन एवं पेरोल उपयोग मार्गदर्शिका एवं गणना नियम)*

---

## 📌 विषय सूची (Table of Contents)
1. [परिचय (Introduction & Overview)](#1-परिचय-introduction--overview)
2. [Excel टेम्पलेट डाउनलोड और भरना (Excel Template Download & Fill)](#2-excel-टेम्पलेट-डाउनलोड-और-भरना)
3. [Excel शीट अपलोड और लाइव एडिटिंग (Upload & In-Table Editing)](#3-excel-शीट-अपलोड-और-लाइव-एडिटिंग)
4. [पेरोल टेबल और "Edit EPF/ESIC/Conveyance" विकल्प](#4-पेरोल-टेबल-और-edit-epfesicconveyance-विकल्प)
5. [सैलरी गणना का गणितीय नियम (Salary Calculation Rules & Formulas)](#5-सैलरी-गणना-का-गणितीय-नियम)
6. [उदाहरण सहित सम्पूर्ण गणना (Step-by-Step Numerical Examples)](#6-उदाहरण-सहित-सम्पूर्ण-गणना)
7. [भुगतान रिकॉर्ड, स्लिप और लेजर (Payment, Payslip & Worker Ledger)](#7-भुगतान-रिकॉर्ड-स्लिप-और-लेजर)
8. [एक्सेल शीट हब एवं रिपोजिटरी (Excel Sheets Hub & Repository)](#8-एक्सेल-शीट-हब-एवं-रिपोजिटरी-excel-sheets-hub--repository)

---

## 1. परिचय (Introduction & Overview)

SNMR HRMS में वर्कर पेरोल सिस्टम को इस प्रकार डिज़ाइन किया गया है कि आपको **रोज़ाना (Daily) मैन्युअली हाजिरी दर्ज करने की आवश्यकता नहीं है**। 

आप सीधे **महीने की एक्सेल शीट (Monthly Excel Sheet)** अपलोड कर सकते हैं, जिससे सिस्टम:
- वर्कर की कुल हाजिरी (Present Days) पहचानता है।
- ओवरटाइम (OT Hours) और ओवरटाइम दर कैलकुलेट करता है।
- **Conveyance Allowance (कन्वेयंस / यात्रा भत्ता)** को ग्रॉस वेज में जोड़ता है।
- वर्कर के व्यक्तिगत **EPF (PF)** और **ESIC** कटौतियां लागू करता है।
- वर्कर द्वारा लिए गए **Advance (खर्चा)** को डिडक्ट करता है।
- **Net Payable (कुल देय राशि)** और **Pending Balance** अपने आप निकालता है।
- वर्कर के **खाता / लेजर (Hisab-Kitab)** और अटेंडेंस रजिस्टर में सारा डेटा स्वतः सिंक कर देता है।

---

## 2. Excel टेम्पलेट डाउनलोड और भरना

### चरण 1: टेम्पलेट डाउनलोड करें
1. मुख्य मेनू से **"Salary"** (Worker Wages & Payroll) पेज खोलें।
2. ऊपर दाईं ओर स्थित हरे रंग के बटन **"Upload Monthly Excel"** पर क्लिक करें।
3. पेरोल का **Month** और **Year** चुनें।
4. **"Download Sample Template (.xlsx)"** बटन पर क्लिक करें।
   > सिस्टम आपके सभी एक्टिव वर्कर्स के नाम और आईडी के साथ प्री-फिल्ड एक्सेल फाइल डाउनलोड कर देगा।

### चरण 2: Excel के प्रमुख कॉलम्स का विवरण

| कॉलम का नाम (Header) | प्रकार | विवरण | उदाहरण |
|---|---|---|---|
| **Worker ID** | टेक्स्ट | वर्कर का यूनिक आईडी कोड | `WRK-001` |
| **Worker Name** | टेक्स्ट | वर्कर का पूरा नाम | `Ramesh Kumar` |
| **Site Name** | टेक्स्ट | प्रोजेक्ट या साइट का नाम | `Site Alpha` |
| **Salary Type** | टेक्स्ट | वेतन का प्रकार: `Daily`, `Monthly`, `Weekly`, `Hourly`, `Contract` | `Daily` |
| **Wage Rate** | नंबर | निर्धारित वेतन दर (₹) | `600` |
| **Present Days** | नंबर | महीने में उपस्थित दिन (आधे दिन के लिए `0.5`, `24.5`) | `26` |
| **OT Hours** | नंबर | महीने का कुल ओवरटाइम घंटे | `8` |
| **Conveyance Allowance** | नंबर | यात्रा / वाहन भत्ता (₹) *(ग्रॉस में जुड़ेगा)* | `1000` |
| **EPF (PF)** | नंबर | वर्कर का प्रोविडेंट फंड डिडक्शन (₹) *(नेट से कटेगा)* | `1200` |
| **ESIC** | नंबर | कर्मचारी राज्य बीमा डिडक्शन (₹) *(नेट से कटेगा)* | `250` |
| **Advance Kharcha** | नंबर | महीने में लिया गया पेशगी / खर्चा (₹) | `1500` |
| **Other Allowances** | नंबर | अन्य भत्ते जैसे खाना, बोनस आदि (₹) | `0` |
| **Other Deductions** | नंबर | अन्य कटौतियां जैसे मेस, रूम आदि (₹) | `0` |
| **Paid Amount** | नंबर | यदि महीने के दौरान कोई भुगतान पहले ही किया गया हो | `0` |
| **Payment Mode** | टेक्स्ट | भुगतान माध्यम: `Bank Transfer`, `Cash`, `UPI`, `Cheque` | `Bank Transfer` |
| **Notes** | टेक्स्ट | कोई विशेष टिप्पणी या रिमार्क | `Site Alpha Monthly Payroll` |

> 💡 **मस्टर रोल (Day 1 से Day 31) सपोर्ट:**  
> यदि आपकी एक्सेल शीट में `Present Days` का सिंगल कॉलम नहीं है, बल्कि तारीखवार कॉलम्स (`1`, `2`, `3` ... `31` या `Day1`, `Day2` ...) हैं, तो सिस्टम उसमें लिखे `P` (Present = 1) और `HD` (Half Day = 0.5) को अपने आप गिनकर कुल दिन निकाल लेता है!

---

## 3. Excel शीट अपलोड और लाइव एडिटिंग

1. **फाइल अपलोड करें:**  
   भरी हुई एक्सेल फाइल (.xlsx / .xls / .csv) को ड्रैग-एंड-ड्रॉप करें या क्लिक करके चुनें।
2. **ऑटोमैटिक कैलकुलेशन व समरी:**  
   सिस्टम शीट को तुरंत स्कैन करता है और समरी कार्ड्स दिखाता है:
   - **Total Workers:** कुल वर्कर्स की संख्या
   - **Total Present Days:** कुल काम के दिन
   - **Total Gross Wages:** कुल ग्रॉस वेतन
   - **Conveyance Allowance:** कुल दिया गया कन्वेयंस
   - **Total EPF (PF):** कुल काटा गया पीएफ
   - **Total ESIC:** कुल काटा गया ईएसआईसी
   - **Advances Deducted:** कुल काटा गया खर्चा
   - **Total Net Payable:** अंतिम कुल देय वेतन राशि
3. **टेबल के अंदर लाइव एडिटिंग (In-Table Live Editing):**  
   अपलोड करने के बाद अगर आपको किसी वर्कर के दिन, कन्वेयंस, पीएफ, ईएसआईसी या खर्चे में बदलाव करना हो, तो आपको दोबारा एक्सेल बनाने की आवश्यकता नहीं है!  
   - आप **सीधे प्रीव्यू टेबल के इनपुट बॉक्स में नया नंबर टाइप कर सकते हैं**।
   - टाइप करते ही उस वर्कर का **Net Payable** और ऊपर का **Total Summary** रियल-टाइम में खुद-ब-खुद अपडेट हो जाता है।
4. **"Confirm & Save All"** बटन दबाएं।  
   डेटा सुरक्षित रूप से डेटाबेस में सेव हो जाएगा और अटेंडेंस व लेजर में सिंक हो जाएगा।

---

## 4. पेरोल टेबल और "Edit EPF/ESIC/Conveyance" विकल्प

अपलोड होने के बाद मुख्य सैलरी टेबल में प्रत्येक वर्कर का रिकॉर्ड दिखने लगता है।

### 🛠️ हर वर्कर के सामने "Edit EPF/ESIC" बटन:
यदि महीने के बीच में या सैलरी जनरेट होने के बाद किसी वर्कर का EPF, ESIC, Conveyance या एडवांस बदलना हो:
1. वर्कर की पंक्ति (row) के आगे हरे रंग के **"Edit EPF/ESIC"** बटन पर क्लिक करें।
2. एक पॉपअप विंडो (Modal) खुलेगी जिसमें निम्न फील्ड्स लाइव एडिट किए जा सकते हैं:
   - **Gross Wages (₹):** कुल अर्जित ग्रॉस वेतन
   - **Conveyance Allowance (₹):** कन्वेयंस भत्ता
   - **EPF / PF Deduction (₹):** पीएफ कटौती
   - **ESIC Deduction (₹):** ईएसआईसी कटौती
   - **Advance / Kharcha Deducted (₹):** खर्चा कटौती
   - **Other Deductions (₹):** अन्य कटौतियां (कमरा/मेस)
   - **Remarks / Notes:** टिप्पणी
3. मॉडल के निचले हिस्से में **Recalculated Net Payable** और **Pending Balance** का लाइव बॉक्स दिखेगा।
4. **"Save & Update Salary"** पर क्लिक करते ही डेटाबेस में नया हिसाब सेव हो जाएगा।

---

## 5. सैलरी गणना का गणितीय नियम (Salary Calculation Rules & Formulas)

सिस्टम में सैलरी की गणना पारदर्शी और मानक औद्योगिक नियमों के आधार पर होती है:

### (A) मूल उपस्थिति वेतन (Base Attendance Wage):
वर्कर के **Salary Type** के अनुसार गणना:
- **Daily (दैनिक):**  
  $$\text{Base Wage} = \text{Present Days} \times \text{Daily Wage Rate}$$
- **Monthly (मासिक):**  
  $$\text{Base Wage} = \left(\frac{\text{Monthly Wage}}{\text{Days in Month (या 26)}}\right) \times \text{Present Days}$$
- **Weekly (साप्ताहिक):**  
  $$\text{Base Wage} = \left(\frac{\text{Weekly Wage}}{6}\right) \times \text{Present Days}$$
- **Hourly (प्रति घंटा):**  
  $$\text{Base Wage} = \text{Present Days} \times 8 \times \text{Hourly Rate}$$
- **Contract (ठेका):**  
  $$\text{Base Wage} = \text{Contract Lump-sum Rate}$$

---

### (B) ओवरटाइम गणना (Overtime - OT Calculation):
- सामान्य कार्य दिवस 8 घंटे का माना जाता है।
- **प्रति घंटा ओवरटाइम दर (OT Rate):**  
  $$\text{OT Rate per Hour} = \frac{\text{Daily Wage Rate}}{8}$$
- **कुल ओवरटाइम राशि (OT Pay):**  
  $$\text{OT Amount} = \text{OT Hours} \times \text{OT Rate}$$

---

### (C) कुल ग्रॉस कमाई (Total Gross Wages):
ग्रॉस वेज में उपस्थिति का वेतन, ओवरटाइम, यात्रा भत्ता और अन्य भत्ते शामिल होते हैं:
$$\mathbf{Gross\ Amount} = \text{Base Wage} + \text{OT Amount} + \text{Conveyance Allowance} + \text{Other Allowances}$$

#### 📄 पेस्लिप ब्रेकअप (Salary Slip Earnings Breakup):
पेस्लिप प्रिंटिंग और वैधानिक रिपोर्टिंग हेतु ग्रॉस का आंतरिक विभाजन:
1. **Basic Salary (मूल वेतन):** $\text{Base Wage} \times 50\%$
2. **Conveyance Allowance (कन्वेयंस):** एक्सेल/एडिट मॉडल में दर्ज वास्तविक राशि
3. **Special Allowance (विशेष भत्ता):** $\text{Gross Amount} - \text{Basic Salary} - \text{Conveyance Allowance}$

---

### (D) कुल कटौतियां (Total Deductions):
वर्कर के वेतन से काटी जाने वाली राशियां:
$$\mathbf{Total\ Deductions} = \text{EPF (PF)} + \text{ESIC} + \text{Professional Tax} + \text{Advance (खर्चा)} + \text{Other Deductions}$$

1. **EPF (PF):** एक्सेल में दिया गया वास्तविक मान (या यदि UAN है तो $\text{Basic} \times 12\%$)
2. **ESIC:** एक्सेल में दिया गया वास्तविक मान (या यदि ESI IP है और ग्रॉस $\le ₹21,000$ है तो $\text{Gross} \times 0.75\%$)
3. **Professional Tax (PT):** यदि ग्रॉस वेतन $\ge ₹15,000$ है तो ₹200 (अन्यथा ₹0)
4. **Advance Kharcha:** एक्सेल में दर्ज राशि या वर्कर द्वारा साइट पर लिया गया बकाया पेशगी।
5. **Other Deductions:** मेस, कमरा या अन्य विविध कटौतियां।

---

### (E) अंतिम देय वेतन (Net Payable):
$$\mathbf{Net\ Payable} = \max(0,\ \mathbf{Gross\ Amount} - \mathbf{Total\ Deductions})$$

---

### (F) बकाया राशि और भुगतान स्थिति (Balance & Status):
$$\mathbf{Balance\ Pending} = \max(0,\ \mathbf{Net\ Payable} - \text{Paid Amount})$$

- **Paid (हरा):** यदि $\text{Balance} == 0$ तथा $\text{Net Payable} > 0$
- **Partial (पीला):** यदि $\text{Paid Amount} > 0$ तथा कुछ $\text{Balance}$ अभी बाकी है
- **Pending (लाल):** यदि अभी तक ₹0 भुगतान हुआ है

---

## 6. उदाहरण सहित सम्पूर्ण गणना

### 📋 उदाहरण 1: दैनिक वेतन भोगी वर्कर (रमेश कुमार)

#### इनपुट डेटा (एक्सेल शीट से):
- **Worker Name:** रमेश कुमार (`WRK-001`)
- **Salary Type:** Daily
- **Wage Rate:** ₹600 प्रति दिन
- **Present Days:** 26 दिन
- **OT Hours:** 8 घंटे
- **Conveyance Allowance:** ₹1,000
- **EPF (PF):** ₹1,200
- **ESIC:** ₹250
- **Advance Kharcha:** ₹1,500
- **Paid Amount:** ₹10,000 (माह के दौरान बैंक ट्रांसफर द्वारा दिए गए)

#### स्टेप-बाय-स्टेप गणना:

1. **मूल उपस्थिति वेतन (Base Wage):**  
   $$26 \times 600 = ₹15,600$$

2. **ओवरटाइम दर व राशि (OT Pay):**  
   $$\text{OT Rate} = \frac{600}{8} = ₹75 \text{ प्रति घंटा}$$  
   $$\text{OT Pay} = 8 \times 75 = ₹600$$

3. **कुल ग्रॉस वेतन (Gross Amount):**  
   $$\text{Gross} = ₹15,600 \text{ (Base)} + ₹600 \text{ (OT)} + ₹1,000 \text{ (Conveyance)} = \mathbf{₹17,200}$$

4. **कुल कटौतियां (Total Deductions):**  
   $$\text{EPF} = ₹1,200$$  
   $$\text{ESIC} = ₹250$$  
   $$\text{Advance Kharcha} = ₹1,500$$  
   $$\text{Total Deductions} = 1,200 + 250 + 1,500 = \mathbf{₹2,950}$$

5. **कुल देय शुद्ध वेतन (Net Payable):**  
   $$\text{Net Payable} = 17,200 - 2,950 = \mathbf{₹14,250}$$

6. **बकाया राशि व स्टेटस (Pending Balance):**  
   $$\text{Paid So Far} = ₹10,000$$  
   $$\text{Pending Balance} = 14,250 - 10,000 = \mathbf{₹4,250}$$  
   $$\text{Status} = \mathbf{Partial\ (आंशिक\ भुगतान)}$$

---

## 7. भुगतान रिकॉर्ड, स्लिप और लेजर

1. **पेमेंट दर्ज करना (Pay Button):**  
   - किसी भी वर्कर के **"Pay"** बटन पर क्लिक करें।
   - बची हुई शेष राशि ऑटोमैटिक भर जाएगी। आप चाहें तो आंशिक (Partial) राशि भी भर सकते हैं।
   - पेमेंट मोड (Bank Transfer / Cash / UPI / Cheque) और UTR/Ref No दर्ज करके सबमिट करें।
2. **सैलरी स्लिप प्रिंट (Slip Button):**  
   - **"Slip"** बटन पर क्लिक करते ही कंपनी लेटरहेड (SNMR FAB INDIA PVT LTD) के साथ आधिकारिक पेस्लिप तैयार हो जाती है, जिसमें Basic, Conveyance, OT, PF, ESIC और Advance अलग-अलग दर्शाए जाते हैं।
3. **खाता-बही / लेजर (Ledger Button):**  
   - **"Ledger"** बटन वर्कर का पूरा **"हिसाब-किताब"** दिखाता है: कब वेतन क्रेडिट हुआ, कब खर्चा (Advance) दिया गया, और कब भुगतान किया गया।
4. **लॉक और सुरक्षा (Lock Single / Month):**  
   - पेरोल फाइनल होने के बाद **"Lock Month Payroll"** बटन दबाएं ताकि कोई अनधिकृत व्यक्ति या भूलवश कोई ऐतिहासिक रिकॉर्ड न बदल सके।

---

## 8. एक्सेल शीट हब एवं रिपोजिटरी (Excel Sheets Hub & Repository)

सभी प्रकार की एक्सेल स्प्रेडशीट्स (.xlsx, .xls, .csv) को स्थायी रूप से सुरक्षित रखने, आसानी से ढूंढने और श्रेणीबद्ध (Categorized) रूप में एक जगह संजोने के लिए सिस्टम में **"Excel Sheets Hub"** उपलब्ध है।

### 8.1 हब को कैसे खोलें?
- **साइडबार मेनू से:** बायीं ओर के मेनू में **"Excel Sheets Hub"** (आइकन: हरा स्प्रेडशीट) पर क्लिक करें।
- **सैलरी पेज से:** **"Salary"** पेज के शीर्ष पर स्थित **"Excel Sheets Hub"** बटन पर क्लिक करें।

### 8.2 लाइव सर्च (Easy Instant Search)
- शीर्ष पर दिए गए **सर्च बार** में फाइल का नाम, टाइटल, कैटेगरी, साइट/प्रोजेक्ट का नाम, या नोट्स का कोई भी शब्द टाइप करें।
- सिस्टम टाइप करते ही तुरंत वही शीट्स स्क्रीन पर फ़िल्टर करके दिखा देता है।

### 8.3 कस्टम कैटेगरी और ग्रुपिंग (Custom Category & Grouping)
- **शीट्स को अपलोड करते समय:**
  - आप पहले से मौजूद कैटेगरी (जैसे `Worker Payroll`, `Monthly Attendance`, `Site Expenses & Advances`, `PF / ESIC Statutory` आदि) में से चुन सकते हैं।
  - या **"+ Create Custom Category"** पर क्लिक करके अपनी मनपसंद नई कैटेगरी (जैसे: `Civil Phase-1 Bills`, `Subcontractor Wages`, `Vendor Invoices` आदि) टाइप कर सकते हैं।
- **कैटेगरी के अनुसार एक जगह देखना (Group by Category):**
  - **"By Category"** व्यू बटन दबाने पर सभी शीट्स अपनी-अपनी कैटेगरी के सुंदर सेक्शंस में एक जगह ग्रुप होकर दिखती हैं, जिससे एक ही श्रेणी की सभी एक्सेल फाइलें एक साथ सुरक्षित रहती हैं और ढूंढने में कोई कठिनाई नहीं होती।
  - ऊपर दिए गए कैटेगरी पिल्स (Category Pills) पर क्लिक करके किसी भी कैटेगरी की सभी फाइलों को 1-क्लिक में देखा जा सकता है।

### 8.4 पासवर्ड सुरक्षा के साथ डिलीट (Password-Protected Deletion)
- किसी भी एक्सेल शीट को गलती से या अनधिकृत रूप से डिलीट होने से बचाने के लिए एडमिन पासवर्ड सुरक्षा लागू की गई है।
- जब आप किसी शीट के **"Delete (कचरा पेटी आइकन)"** पर क्लिक करेंगे:
  - एक सुरक्षा विंडो (Security Modal) खुलेगी।
  - उसमें एडमिन सिक्योरिटी पासवर्ड (`Password@123`) दर्ज करना अनिवार्य होगा।
  - सही पासवर्ड दर्ज करने पर ही फाइल डेटाबेस और सर्वर स्टोरेज से स्थायी रूप से हटाई जा सकेगी।

### 8.5 इन-ब्राउज़र प्रिव्यू और 1-क्लिक पेरोल
- **Preview बटन:** बिना फाइल डाउनलोड किए सीधे ब्राउज़र के अंदर ही एक्सेल शीट की पंक्तियों और कॉलम्स को देखने की सुविधा।
- **Download बटन:** मूल एक्सेल/सीएसवी फाइल को अपने कंप्यूटर पर डाउनलोड करने की सुविधा।
- **Process Payroll बटन:** यदि कोई शीट पेरोल श्रेणी की है, तो 1-क्लिक में सीधे पेरोल कैलकुलेशन इंजन में लोड करने की सुविधा।
