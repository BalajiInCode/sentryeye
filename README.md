# SentryEye 👁️
> *"A camera that doesn't just watch. It thinks."*

An AI-powered smart CCTV camera concept for college campus safety, real-time threat detection, and automated student attendance.

---

## 🌟 Overview & Highlights

**SentryEye** is a concept college engineering project designed to transform traditional campus surveillance from passive forensic recording into active, autonomous edge-AI incident response.

- **Dark, Modern Cyber Aesthetic**: Futuristic HUD styling with neon cyan (`#00f0ff`) and teal accents, glassmorphism, scanlines, and animated telemetry.
- **Zero Frameworks**: Built strictly with vanilla **HTML5**, **CSS3**, and **JavaScript** in a single folder for maximum speed, zero dependencies, and instant free hosting on **GitHub Pages**.
- **Embedded Story Video**: Integrates the local narrated video `SentryEye_Story_WithVoice.mp4` with custom HUD video controls and download options.
- **Interactive Edge-AI Demo**:
  - 🔥 **Simulate Fire**: Displays a red bounding box with `FIRE 97%` confidence tag and sounds a dual-tone emergency siren.
  - ⚠️ **Simulate Tampering**: Triggers static interference, accelerometer displacement alerts, and a `TAMPERING DETECTED / NO SIGNAL` glitch banner with siren alarm.
  - 🎓 **Mark Attendance**: Renders face detection bounding boxes, student biometric verification tags, and an animated green `ATTENDANCE MARKED` roster.
  - 🔊 **Web Audio API**: Built-in procedural sound synthesizer with an interactive **Mute Toggle** button.
- **SCAMPER Innovation Framework**: 7 comprehensive cards detailing how everyday CCTV was re-engineered:
  - **[S] Substitute**: AI monitoring instead of manual watching
  - **[C] Combine**: Camera vision + thermal sensing + tamper protection
  - **[A] Adapt**: AI facial-recognition attendance
  - **[M] Modify**: Ring of LED lights around the lens for wider night coverage
  - **[P] Put to another use**: Optional metal-sensor module
  - **[E] Eliminate**: Single PoE cable for power and data
  - **[R] Reverse**: Rotating/movable camera (drone style as future scope)
- **UI Effects (vanilla JS, no React)** in `effects.js`:
  - **Cursor Grid**: background grid lights up around the cursor, click sends a ripple
  - **Variable Proximity**: hero title letters get bolder near the cursor
  - **Gooey Nav**: navbar pill with gooey droplets that follows the section you are on
- **Call-to-Action**: "Invest in SentryEye" button featuring an honorary seed supporter certificate and interactive confetti animation.
- **Footer**: "SentryEye - College Project 2026".

---

## 🚀 How to Run Locally

Because SentryEye uses pure standard web technologies, you can run it immediately without installing any build tools:

### Option 1: Direct Browser Launch
Simply double-click `index.html` to open it in Google Chrome, Microsoft Edge, Firefox, or Safari.

### Option 2: Local HTTP Server (Recommended for Media Streaming)
Using Python:
```bash
python -m http.server 8000
```
Then visit [http://localhost:8000](http://localhost:8000) in your web browser.

---

## 🌐 How to Host Free on GitHub Pages

1. Push this folder to a GitHub repository (e.g. `github.com/<your-username>/sentryeye`).
2. Go to repository **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**.
5. Within 1–2 minutes, your website will be live at:
   `https://<your-username>.github.io/<repository-name>/`

---

## 📁 Project Structure

```
scamper-reprentation/
├── index.html                     # Semantic HTML5 single-page structure
├── style.css                      # Cyber-modern dark responsive styles & animations
├── script.js                      # Web Audio API siren, interactive demo & modal logic
├── effects.js                     # Cursor grid, variable-weight title, gooey navbar (vanilla JS)
├── SentryEye_Story_WithVoice.mp4  # Concept video with voice narration
└── README.md                      # Documentation & project guide
```

---

## 🎓 Academic Attribution

**College Project 2026** • Department of Computer Science & Engineering • Campus Safety & Edge AI Initiative
