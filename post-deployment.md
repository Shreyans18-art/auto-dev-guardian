# 🌍 Post-Deployment System (Real User Monitoring)

After deployment, FaultPulse monitors **real user behavior** using a browser SDK.

---

## 🧠 What Happens

1. User visits website
2. SDK runs in browser
3. Captures:

   * Load time
   * JS errors
   * Stack trace
4. Sends data to backend
5. Backend stores in `rum.json`
6. Dashboard visualizes insights

---

## 📡 Data Collected

```
{
  type: "error",
  message: "...",
  line: 12,
  stack: "..."
}
```

---

## 📊 Metrics

* Total Events → total logs collected
* Errors → runtime failures
* Avg Load Time → performance
* Anomalies → unusual spikes

---

## 🔥 Benefits

* Real-world debugging
* Device-specific insights
* Continuous monitoring
* Production visibility

---

## 💡 Insight

This phase answers:

```
“What is actually happening?”
```
