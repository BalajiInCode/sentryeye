/**
 * SentryEye - Autonomous Campus Security Concept
 * College Project 2026
 * Pure Vanilla JavaScript (Zero External Frameworks)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. Navigation & Mobile Drawer (Auto-closes on tap)
  // =========================================================================
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mainNav.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile nav when clicking any link inside the navigation drawer
    const allNavAnchors = mainNav.querySelectorAll('a');
    allNavAnchors.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside of the navbar
    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('nav-open') && !mainNav.contains(e.target) && !navToggle.contains(e.target)) {
        mainNav.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scroll helper for Hero buttons
  const heroWatchBtn = document.getElementById('heroWatchBtn');
  const heroDemoBtn = document.getElementById('heroDemoBtn');

  if (heroWatchBtn) {
    heroWatchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('video');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (heroDemoBtn) {
    heroDemoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('demo');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // =========================================================================
  // 2. Real-time Digital Clock on Mock CCTV HUD
  // =========================================================================
  const screenClock = document.getElementById('screenClock');
  function updateScreenClock() {
    if (!screenClock) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    screenClock.textContent = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  updateScreenClock();
  setInterval(updateScreenClock, 1000);

  // =========================================================================
  // 3. Web Audio API Siren & Sound Synthesizer
  // =========================================================================
  let audioCtx = null;
  let activeAudioNodes = [];
  let isMuted = false;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function stopActiveSounds() {
    activeAudioNodes.forEach(item => {
      try {
        if (item.gainNode) {
          const currTime = audioCtx ? audioCtx.currentTime : 0;
          item.gainNode.gain.cancelScheduledValues(currTime);
          item.gainNode.gain.setValueAtTime(item.gainNode.gain.value, currTime);
          item.gainNode.gain.linearRampToValueAtTime(0.0001, currTime + 0.05);
        }
        setTimeout(() => {
          if (item.osc) item.osc.stop();
          if (item.timer) clearTimeout(item.timer);
        }, 60);
      } catch (err) {
        // Node may already be stopped
      }
    });
    activeAudioNodes = [];
  }

  /**
   * Fire Siren: High-low European emergency siren wail
   */
  function playFireSiren() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    stopActiveSounds();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    const duration = 3.6;

    // Frequency modulation wail (650Hz <-> 960Hz)
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(960, now + 0.4);
    osc.frequency.linearRampToValueAtTime(650, now + 0.8);
    osc.frequency.linearRampToValueAtTime(960, now + 1.2);
    osc.frequency.linearRampToValueAtTime(650, now + 1.6);
    osc.frequency.linearRampToValueAtTime(960, now + 2.0);
    osc.frequency.linearRampToValueAtTime(650, now + 2.4);
    osc.frequency.linearRampToValueAtTime(960, now + 2.8);
    osc.frequency.linearRampToValueAtTime(650, now + 3.2);

    // Master volume envelope
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.08);
    gainNode.gain.setValueAtTime(0.25, now + duration - 0.4);
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    const nodeRef = { osc, gainNode };
    activeAudioNodes.push(nodeRef);
    nodeRef.timer = setTimeout(() => {
      const idx = activeAudioNodes.indexOf(nodeRef);
      if (idx > -1) activeAudioNodes.splice(idx, 1);
    }, duration * 1000 + 100);
  }

  /**
   * Tamper Siren: Rapid staccato warning buzzer / alarm beep
   */
  function playTamperAlarm() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    stopActiveSounds();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'square';
    const now = ctx.currentTime;
    const duration = 2.8;

    // Beeping frequency jumps
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(740, now + 0.25);
    osc.frequency.setValueAtTime(880, now + 0.5);
    osc.frequency.setValueAtTime(740, now + 0.75);
    osc.frequency.setValueAtTime(880, now + 1.0);
    osc.frequency.setValueAtTime(740, now + 1.25);
    osc.frequency.setValueAtTime(880, now + 1.5);
    osc.frequency.setValueAtTime(740, now + 1.75);
    osc.frequency.setValueAtTime(880, now + 2.0);
    osc.frequency.setValueAtTime(740, now + 2.25);

    // Staccato gain gating
    gainNode.gain.setValueAtTime(0.001, now);
    for (let t = 0; t < duration - 0.3; t += 0.25) {
      gainNode.gain.setValueAtTime(0.22, now + t);
      gainNode.gain.setValueAtTime(0.02, now + t + 0.18);
    }
    gainNode.gain.linearRampToValueAtTime(0.0001, now + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);

    const nodeRef = { osc, gainNode };
    activeAudioNodes.push(nodeRef);
    nodeRef.timer = setTimeout(() => {
      const idx = activeAudioNodes.indexOf(nodeRef);
      if (idx > -1) activeAudioNodes.splice(idx, 1);
    }, duration * 1000 + 100);
  }

  /**
   * Attendance Chime: Futuristic ascending dual harmonic chime
   */
  function playAttendanceChime() {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    stopActiveSounds();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gainNode.gain.setValueAtTime(0.001, now + i * 0.08);
      gainNode.gain.linearRampToValueAtTime(0.18, now + i * 0.08 + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.65);

      const nodeRef = { osc, gainNode };
      activeAudioNodes.push(nodeRef);
    });
  }

  // =========================================================================
  // 4. Mute / Unmute Button Controller (Fix: Only 1 icon displays at a time)
  // =========================================================================
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const iconUnmuted = document.getElementById('iconUnmuted');
  const iconMuted = document.getElementById('iconMuted');
  const audioStatusText = document.getElementById('audioStatusText');

  // Initial display guarantee: Unmuted icon visible, muted icon hidden
  if (iconUnmuted) iconUnmuted.classList.remove('hidden');
  if (iconMuted) iconMuted.classList.add('hidden');

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      // Initialize audio context on explicit user gesture
      getAudioContext();

      isMuted = !isMuted;
      if (isMuted) {
        stopActiveSounds();
        audioToggleBtn.classList.add('is-muted');
        if (iconUnmuted) iconUnmuted.classList.add('hidden');
        if (iconMuted) iconMuted.classList.remove('hidden');
        if (audioStatusText) audioStatusText.textContent = 'Siren: MUTED';
      } else {
        audioToggleBtn.classList.remove('is-muted');
        if (iconUnmuted) iconUnmuted.classList.remove('hidden');
        if (iconMuted) iconMuted.classList.add('hidden');
        if (audioStatusText) audioStatusText.textContent = 'Siren: ON';
      }
    });
  }

  // =========================================================================
  // 5. Interactive Demo Scenario Controller
  // =========================================================================
  const btnSimFire = document.getElementById('btnSimFire');
  const btnSimTamper = document.getElementById('btnSimTamper');
  const btnSimAttendance = document.getElementById('btnSimAttendance');
  const btnSimReset = document.getElementById('btnSimReset');

  const overlayFire = document.getElementById('overlayFire');
  const overlayTamper = document.getElementById('overlayTamper');
  const overlayAttendance = document.getElementById('overlayAttendance');
  const mockScreen = document.getElementById('mockScreen');
  const idleCrosshairs = document.getElementById('idleCrosshairs');

  // Telemetry HUD items
  const sensorThermal = document.getElementById('sensorThermal');
  const sensorGyro = document.getElementById('sensorGyro');
  const sensorMetal = document.getElementById('sensorMetal');
  const aiPipelineStatus = document.getElementById('aiPipelineStatus');

  const simButtons = [btnSimFire, btnSimTamper, btnSimAttendance];

  function clearActiveButtonStates() {
    simButtons.forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
  }

  function hideAllOverlays() {
    if (overlayFire) overlayFire.classList.add('hidden');
    if (overlayTamper) overlayTamper.classList.add('hidden');
    if (overlayAttendance) overlayAttendance.classList.add('hidden');
  }

  function resetTelemetryHUD() {
    if (sensorThermal) {
      sensorThermal.textContent = 'FLIR [OK]';
      sensorThermal.className = 't-val ok';
    }
    if (sensorGyro) {
      sensorGyro.textContent = 'IMU-6AXIS [OK]';
      sensorGyro.className = 't-val ok';
    }
    if (sensorMetal) {
      sensorMetal.textContent = 'MET-AUX [STANDBY]';
      sensorMetal.className = 't-val ok';
    }
    if (aiPipelineStatus) {
      aiPipelineStatus.textContent = 'IDLE / SURVEILLANCE_v2';
      aiPipelineStatus.className = 't-val highlight';
    }
    if (mockScreen) {
      mockScreen.setAttribute('data-state', 'idle');
    }
    // Show AI Tracker label only in idle mode
    if (idleCrosshairs) {
      idleCrosshairs.style.display = '';
    }
  }

  // Scenario 1: Fire
  if (btnSimFire) {
    btnSimFire.addEventListener('click', () => {
      getAudioContext();
      clearActiveButtonStates();
      hideAllOverlays();
      btnSimFire.classList.add('active');

      // Hide AI Tracker label so it never overlaps alerts
      if (idleCrosshairs) idleCrosshairs.style.display = 'none';

      if (overlayFire) overlayFire.classList.remove('hidden');
      if (mockScreen) mockScreen.setAttribute('data-state', 'fire');

      // Update telemetry readouts
      if (sensorThermal) {
        sensorThermal.textContent = 'FLIR [ALERT: 342°C]';
        sensorThermal.className = 't-val text-danger';
      }
      if (sensorGyro) {
        sensorGyro.textContent = 'IMU-6AXIS [OK]';
        sensorGyro.className = 't-val ok';
      }
      if (aiPipelineStatus) {
        aiPipelineStatus.textContent = 'CRITICAL / FIRE_DETECTED_97%';
        aiPipelineStatus.className = 't-val text-danger';
      }

      // Play Siren via Web Audio API
      playFireSiren();
    });
  }

  // Scenario 2: Tampering
  if (btnSimTamper) {
    btnSimTamper.addEventListener('click', () => {
      getAudioContext();
      clearActiveButtonStates();
      hideAllOverlays();
      btnSimTamper.classList.add('active');

      // Hide AI Tracker label so it never overlaps alerts
      if (idleCrosshairs) idleCrosshairs.style.display = 'none';

      if (overlayTamper) overlayTamper.classList.remove('hidden');
      if (mockScreen) mockScreen.setAttribute('data-state', 'tamper');

      // Update telemetry readouts
      if (sensorGyro) {
        sensorGyro.textContent = 'IMU-6AXIS [TILT +54° DISPLACED]';
        sensorGyro.className = 't-val text-danger';
      }
      if (sensorThermal) {
        sensorThermal.textContent = 'FLIR [OK]';
        sensorThermal.className = 't-val ok';
      }
      if (aiPipelineStatus) {
        aiPipelineStatus.textContent = 'ALERT / TAMPER_NO_SIGNAL';
        aiPipelineStatus.className = 't-val text-danger';
      }

      // Play Alarm via Web Audio API
      playTamperAlarm();
    });
  }

  // Scenario 3: Attendance
  if (btnSimAttendance) {
    btnSimAttendance.addEventListener('click', () => {
      getAudioContext();
      clearActiveButtonStates();
      hideAllOverlays();
      btnSimAttendance.classList.add('active');

      // Hide AI Tracker label so it never overlaps student cards
      if (idleCrosshairs) idleCrosshairs.style.display = 'none';

      if (overlayAttendance) overlayAttendance.classList.remove('hidden');
      if (mockScreen) mockScreen.setAttribute('data-state', 'attendance');

      // Update telemetry readouts
      if (sensorThermal) {
        sensorThermal.textContent = 'FLIR [OK]';
        sensorThermal.className = 't-val ok';
      }
      if (sensorGyro) {
        sensorGyro.textContent = 'IMU-6AXIS [OK]';
        sensorGyro.className = 't-val ok';
      }
      if (aiPipelineStatus) {
        aiPipelineStatus.textContent = 'SUCCESS / 4_FACES_VERIFIED';
        aiPipelineStatus.className = 't-val ok';
      }

      // Play Electronic Confirmation Chime
      playAttendanceChime();
    });
  }

  // Reset Feed
  if (btnSimReset) {
    btnSimReset.addEventListener('click', () => {
      stopActiveSounds();
      clearActiveButtonStates();
      hideAllOverlays();
      resetTelemetryHUD();
    });
  }

  // =========================================================================
  // 6. Video Player Play Overlay Helper
  // =========================================================================
  const sentryVideo = document.getElementById('sentryVideo');
  const videoPlayHint = document.getElementById('videoPlayHint');
  const customPlayBtn = document.getElementById('customPlayBtn');

  function startVideoPlayback() {
    if (sentryVideo) {
      sentryVideo.play().then(() => {
        if (videoPlayHint) videoPlayHint.classList.add('hidden');
      }).catch(err => {
        console.warn('Video playback deferred until gesture:', err);
      });
    }
  }

  if (customPlayBtn) {
    customPlayBtn.addEventListener('click', startVideoPlayback);
  }
  if (videoPlayHint) {
    videoPlayHint.addEventListener('click', startVideoPlayback);
  }

  if (sentryVideo) {
    sentryVideo.addEventListener('play', () => {
      if (videoPlayHint) videoPlayHint.classList.add('hidden');
    });
    sentryVideo.addEventListener('pause', () => {
      if (sentryVideo.currentTime === 0 || sentryVideo.ended) {
        if (videoPlayHint) videoPlayHint.classList.remove('hidden');
      }
    });
  }

  // =========================================================================
  // 7. Chroma Grid Spotlight Hover Effect on SCAMPER Cards
  // =========================================================================
  const scamperGrid = document.getElementById('scamperGrid');
  const scamperCards = document.querySelectorAll('.scamper-card');

  const isTouchDevice = window.matchMedia('(hover: none)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (scamperGrid && scamperCards.length > 0 && !isTouchDevice && !prefersReduced) {
    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isHovering = false;
    let animFrame = null;
    const spotlightRadius = 250; // ~250px circular spotlight

    function renderChroma() {
      // Smooth movement with lerp
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      scamperGrid.style.setProperty('--mx', `${currentX.toFixed(1)}px`);
      scamperGrid.style.setProperty('--my', `${currentY.toFixed(1)}px`);

      const gridRect = scamperGrid.getBoundingClientRect();

      scamperCards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        // Calculate relative coordinates of card within scamperGrid
        const cardLeft = cardRect.left - gridRect.left;
        const cardRight = cardRect.right - gridRect.left;
        const cardTop = cardRect.top - gridRect.top;
        const cardBottom = cardRect.bottom - gridRect.top;

        // Closest point on the card bounding box to the current mouse position
        const closestX = Math.max(cardLeft, Math.min(currentX, cardRight));
        const closestY = Math.max(cardTop, Math.min(currentY, cardBottom));

        const dx = currentX - closestX;
        const dy = currentY - closestY;
        const distance = Math.hypot(dx, dy);

        if (distance < spotlightRadius && isHovering) {
          // Inside spotlight: calculate intensity (0 at edge to 1 directly over card)
          const factor = 1 - (distance / spotlightRadius);
          const grayscaleVal = (0.8 * (1 - factor)).toFixed(3);
          const brightnessVal = (0.9 + 0.18 * factor).toFixed(3);

          card.style.setProperty('--card-gray', grayscaleVal);
          card.style.setProperty('--card-bright', brightnessVal);
          card.style.borderColor = `rgba(0, 240, 255, ${(0.15 + 0.5 * factor).toFixed(2)})`;
          card.style.boxShadow = `0 12px 35px rgba(0, 0, 0, 0.45), 0 0 ${(30 * factor).toFixed(1)}px rgba(0, 240, 255, ${(0.35 * factor).toFixed(2)})`;
        } else {
          // Outside spotlight: desaturated
          card.style.setProperty('--card-gray', '0.8');
          card.style.setProperty('--card-bright', '0.9');
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }
      });

      // Continue animating until settled
      if (isHovering || Math.abs(currentX - targetX) > 0.4 || Math.abs(currentY - targetY) > 0.4) {
        animFrame = requestAnimationFrame(renderChroma);
      } else {
        animFrame = null;
      }
    }

    scamperGrid.addEventListener('mousemove', (e) => {
      const rect = scamperGrid.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;

      if (!isHovering) {
        isHovering = true;
        scamperGrid.classList.add('has-mouse');
        currentX = targetX;
        currentY = targetY;
      }

      if (!animFrame) {
        animFrame = requestAnimationFrame(renderChroma);
      }
    });

    scamperGrid.addEventListener('mouseenter', (e) => {
      const rect = scamperGrid.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      currentX = targetX;
      currentY = targetY;
      isHovering = true;
      scamperGrid.classList.add('has-mouse');

      if (!animFrame) {
        animFrame = requestAnimationFrame(renderChroma);
      }
    });

    scamperGrid.addEventListener('mouseleave', () => {
      isHovering = false;
      scamperGrid.classList.remove('has-mouse');
      targetX = -1000;
      targetY = -1000;

      if (!animFrame) {
        animFrame = requestAnimationFrame(renderChroma);
      }
    });
  }

  // =========================================================================
  // 8. Invest in SentryEye Modal & Confetti Celebration
  // =========================================================================
  const investBtn = document.getElementById('investBtn');
  const investModal = document.getElementById('investModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const btnModalAcknowledge = document.getElementById('btnModalAcknowledge');
  const certNumber = document.getElementById('certNumber');

  function openInvestModal() {
    if (investModal) {
      // Generate randomized academic pledge ID
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      if (certNumber) {
        certNumber.textContent = `PLEDGE-ID #2026-SE-${randomDigits}`;
      }

      investModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';

      // Play joyful harmonic chime on modal open
      playAttendanceChime();

      // Launch celebration confetti
      fireConfettiCelebration();
    }
  }

  function closeInvestModal() {
    if (investModal) {
      investModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  if (investBtn) {
    investBtn.addEventListener('click', openInvestModal);
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeInvestModal);
  }

  if (btnModalAcknowledge) {
    btnModalAcknowledge.addEventListener('click', closeInvestModal);
  }

  if (investModal) {
    investModal.addEventListener('click', (e) => {
      if (e.target === investModal) {
        closeInvestModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && investModal && !investModal.classList.contains('hidden')) {
      closeInvestModal();
    }
  });

  /**
   * Lightweight Particle Confetti in Pure JavaScript
   */
  function fireConfettiCelebration() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1001';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#00f0ff', '#14b8a6', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'];
    const particles = [];
    const particleCount = 75;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 150,
        y: canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 1.2) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        alpha: 1,
        gravity: 0.35
      });
    }

    let animationFrameId;
    const startTime = performance.now();

    function render(time) {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.alpha -= 0.009;

        if (p.alpha > 0) {
          activeParticles++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
          ctx.restore();
        }
      });

      if (activeParticles > 0 && elapsed < 3500) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrameId);
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // =========================================================================
  // 9. Scroll-triggered Reveal Animations (IntersectionObserver)
  // =========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
});
