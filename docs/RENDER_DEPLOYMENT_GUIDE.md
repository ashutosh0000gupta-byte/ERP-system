# 🚀 Render par Backend Deploy karne ka Aasan Guide (Hinglish)

Yeh guide aapko step-by-step batayega ki **Render.com** par apna backend aur database 5 minute me kaise live karein, taaki aapka **Mobile App 24x7 bina laptop ke chal sake**.

---

## 🌟 Tarika 1: 1-Click Blueprint (Sabse Aasan Tarika)

Repo me pehle se hi `render.yaml` config file ready kar di gayi hai.

1. **Render par Login karein:**  
   - Browser me [https://render.com](https://render.com) kholein.  
   - **Sign in with GitHub** par click karke login karein.
2. **New Blueprint chunein:**  
   - Render dashboard me upar **New +** button par click karein.  
   - List me se **Blueprint** par click karein.
3. **Apna GitHub Repo Connect karein:**  
   - Repo select karein: `ashutosh0000gupta-byte/ERP-system`.  
   - Branch: `main`.  
   - Render automatically `render.yaml` ko detect kar lega.  
   - Isme **PostgreSQL Database** aur **Backend Web Service** dono automatically configure ho jayenge.
4. **Apply / Deploy par click karein:**  
   - Render database aur backend ko live karna shuru kar dega (lagbhag 2-3 minute lagenge).
5. **Apna Live URL Note karein:**  
   - Deploy hone ke baad aapko ek link milega, jaise:  
     `https://hrms-backend-xxxx.onrender.com`
   - Iske aage `/api` lagayein:  
     👉 **`https://hrms-backend-xxxx.onrender.com/api`**

---

## 🛠️ Tarika 2: Manual Web Service Setup (Step-by-Step)

Agar aap manually banana chahein:

### Step 1: Free PostgreSQL Database Banayein
1. Render dashboard par **New +** -> **PostgreSQL** chunein.
2. Name: `hrms-db`
3. Database: `hrms_db`
4. User: `hrms_admin`
5. Plan: **Free** select karein.
6. **Create Database** par click karein.
7. Ban jane ke baad **Internal Database URL** (ya External) copy kar lein.

### Step 2: Backend Web Service Banayein
1. **New +** -> **Web Service** par click karein.
2. Apna repo `ashutosh0000gupta-byte/ERP-system` connect karein.
3. Ye settings bharein:
   - **Name:** `hrms-backend`
   - **Region:** Singapore / Frankfurt / Oregon (koi bhi)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npm run build`
   - **Start Command:** `npx prisma db push && node dist-seed/prisma/seed.js && node dist/index.js`
   - **Instance Type:** `Free`
4. **Environment Variables** add karein:
   - `DATABASE_URL`: *(Step 1 me jo URL copy kiya tha)*
   - `JWT_ACCESS_SECRET`: `change-me-access-secret-64-chars-minimum-length-please`
   - `JWT_REFRESH_SECRET`: `change-me-refresh-secret-64-chars-minimum-length-please`
   - `PII_ENCRYPTION_KEY`: `hrms-dev-pii-encryption-key-32-chars-min`
   - `NODE_ENV`: `production`
   - `PORT`: `4000`
   - `CORS_ORIGINS`: `*`
5. **Create Web Service** par click karein.

---

## 📱 Mobile App me Render URL Kaise Dalein?

Render se jab aapko URL mil jaye (jaise `https://hrms-backend-xxxx.onrender.com/api`):

1. Apne mobile me **SNMR ERP App** kholein.
2. Login screen par [Sign In] button ke niche **"⚙️ Server Settings (सर्वर IP बदलें)"** par click karein.
3. Box me apna Render ka URL daal dein:  
   `https://hrms-backend-xxxx.onrender.com/api`
4. **"🔍 Test Connection"** dabayein — screen par **"✅ Server Connected!"** dikhega.
5. **"💾 Save & Connect"** daba dein!

Ab aapka app poori tarah cloud se connect ho gaya hai. Ab aap:
* Laptop band rakh sakte hain.
* Mobile 5G ya 4G data par chalega.
* Kahin se bhi daily expenses (kharch), hajiri aur advances submit kar sakte hain!
