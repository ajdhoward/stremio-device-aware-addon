# 📺 Stremio Device-Aware Add-on

This repository provides a **device-aware Stremio add-on** that filters streams based on device capabilities automatically, allowing seamless and optimized streaming experiences across your devices.

## 🚀 Features
✅ Device detection (simulated via User-Agent for now)  
✅ Stream aggregation (simulated for testing)  
✅ Filtering by resolution and codec  
✅ Caching for fast response  
✅ Ready for Render.com deployment with a single click.

## 🌐 Deployment on Render

1️⃣ Fork or upload this repository to your **GitHub**.  
2️⃣ Go to [Render](https://render.com/) and create a **New Web Service**.  
3️⃣ Connect your GitHub repository.  
4️⃣ Set:
- Environment: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Port: `10000` (or leave empty for auto-detection)

5️⃣ Click **Deploy**.

Once deployed, your add-on will be live at:
```
https://your-app-name.onrender.com/manifest.json
```

## 🎬 Using with Stremio

1️⃣ Open Stremio.  
2️⃣ Go to **Add-ons > Community Add-on**.  
3️⃣ Paste your live `manifest.json` URL and install.  
4️⃣ Start browsing and streaming with device-aware filtering automatically applied.

---

## 🛠️ Notes

- This version uses **simulated data for testing**. Real Torrentio/Torbox integration can be added next.
- Expandable with Supabase/Next.js for profile management as needed.
- All code is MIT licensed, and you fully control your deployment and data.

Enjoy seamless, device-optimized streaming! 🚀
