# 🚀 FaultPulse — AI-Powered Observability & Auto-Debugging System

FaultPulse is a full-stack system that detects, analyzes, and explains errors across the entire software lifecycle — from **pre-deployment (CI/CD)** to **post-deployment (real users)**.

---

## 🧠 What It Does

* 🔍 Detects issues using automated bots (network, headers, DNS, etc.)
* ⚡ Captures real user errors using Browser SDK (RUM)
* 🧠 Explains errors using AI (Groq / LLM)
* 🔧 Suggests fixes (code-level)
* 📊 Visualizes everything in a modern dashboard

---

## 🧩 Architecture

```
User → SDK → Backend → AI Engine → Dashboard
```

---

## 🔥 Features

### ✅ Pre-Deployment

* CI/CD integration
* Automated testing bots
* Smart report generation
* Auto-merge decisions

### 🌍 Post-Deployment (RUM)

* Real user monitoring
* Performance tracking
* Error capturing (JS runtime)
* Device/network insights

### 🧠 AI Intelligence

* Error explanation
* Root cause analysis
* Fix suggestions (code)
* Fallback + retry system

### 📊 Dashboard

* Performance graphs
* Error insights
* Stack trace debugging
* Occurrence tracking

---

## 📁 Project Structure

```
auto-dev-guardian/
│
├── sdk/                # Browser SDK
├── core/               # Runner engine
├── bots/               # Detection bots
├── reports/            # Generated reports
├── dashboard/          # React UI
├── server.js           # Backend API
```

---

## ⚙️ Setup

### 1. Install dependencies

```
npm install
cd dashboard && npm install
```

---

### 2. Add environment variables

Create `.env`:

```
GROQ_API_KEY=your_api_key
```

---

### 3. Run system

**Backend**

```
node server.js
```

**Frontend**

```
cd dashboard
npm run dev
```

**SDK test**

```
npx serve .
```

---

## 🌐 URLs

* Dashboard → http://localhost:5173
* Backend → http://localhost:5000
* Test Page → http://localhost:3000/test.html

---

## 🧪 Testing

Open `test.html` → triggers errors → view dashboard updates.

---

## 💀 Why FaultPulse?

Most tools either:

* monitor ❌
* or analyze ❌

FaultPulse does BOTH:

```
Detect → Explain → Fix → Visualize
```

---

## 🚀 Future Roadmap

* 🔥 GitHub auto-fix PR bot
* 📈 Real-time streaming dashboard
* 🤖 AI-based anomaly prediction
* 🌍 SaaS deployment

---

## 👨‍💻 Built With

* Node.js
* React + Chart.js
* Browser APIs (RUM)
* Groq AI API

---

## 🧠 Final Thought

FaultPulse is not just a tool —
it’s a **developer assistant that thinks.**
## ⚖️ License
This project is **Proprietary**. All rights are reserved by the author. 
No one is permitted to distribute, modify, or use this software for any purpose 
without explicit permission.
