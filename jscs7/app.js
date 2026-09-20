/**
 * ChronoRole — Interactive Role-Based Alarm Studio Logic
 * Pure Vanilla JavaScript: Web Audio API synthesis, precision alarm engine,
 * persistence, role categorization, presets, and audio-visual ring alerts.
 */
(() => {
  'use strict';

  // ==========================================
  // 1. Constants & Role Definitions
  // ==========================================
  const STORAGE_KEY = 'chronorole_alarms_v1';
  const THEME_KEY = 'chronorole_theme_v1';

  const ROLE_CONFIGS = {
    study: {
      name: 'Study',
      icon: '📖',
      color: '#818cf8',
      defaultSound: 'study-bell',
      defaultChecklist: 'Focus Mode: Silence phone notifications, open your study materials, and begin your focused block.',
      quotes: [
        '“Success is the sum of small efforts, repeated day in and day out.”',
        '“Concentrate all your thoughts upon the work at hand.”',
        '“The secret of getting ahead is getting started.”'
      ]
    },
    sleep: {
      name: 'Sleep',
      icon: '💤',
      color: '#38bdf8',
      defaultSound: 'chime',
      defaultChecklist: 'Sleep Routine: Dim ambient lights, disconnect from screens, and breathe deeply for rejuvenating rest.',
      quotes: [
        '“Sleep is the best meditation.” — Dalai Lama',
        '“A good laugh and a long sleep are the best cures in the book.”',
        '“Your future depends on your dreams, so go to sleep!”'
      ]
    },
    work: {
      name: 'Work',
      icon: '💻',
      color: '#34d399',
      defaultSound: 'digital-pulse',
      defaultChecklist: 'Productivity Sprint: Check your top priority task, minimize distractions, and dive into action.',
      quotes: [
        '“Simplicity is prerequisite for reliability.”',
        '“Action is the foundational key to all success.”',
        '“Focus on being productive instead of busy.”'
      ]
    },
    fitness: {
      name: 'Fitness',
      icon: '🏃',
      color: '#fbbf24',
      defaultSound: 'energize',
      defaultChecklist: 'Health Check: Drink 250ml water, stretch your back and neck, take 10 deep breaths and move!',
      quotes: [
        '“Take care of your body. It’s the only place you have to live.”',
        '“Small daily habits make monumental differences in health.”',
        '“Hydrate, stretch, energize!”'
      ]
    },
    custom: {
      name: 'Custom',
      icon: '⭐',
      color: '#fb7185',
      defaultSound: 'digital-pulse',
      defaultChecklist: 'Scheduled Event: Time for your scheduled commitment or personal milestone.',
      quotes: [
        '“Time is what we want most, but what we use worst.”',
        '“Be on time, stay intentional.”'
      ]
    }
  };

  const DEFAULT_ALARMS = [
    {
      id: 'default-study-1',
      role: 'study',
      title: 'Deep Focus & Reading Session',
      time: '14:00',
      repeatDays: [1, 2, 3, 4, 5], // Mon-Fri
      sound: 'study-bell',
      actionPrompt: 'Open chapter notes, set phone on Do-Not-Disturb, and focus for 45 mins.',
      enabled: true,
      lastFired: ''
    },
    {
      id: 'default-sleep-1',
      role: 'sleep',
      title: 'Bedtime Wind-Down & Sleep',
      time: '22:30',
      repeatDays: [0, 1, 2, 3, 4, 5, 6], // Everyday
      sound: 'chime',
      actionPrompt: 'Dim bedroom lights, put away phone, relax and prepare for deep sleep.',
      enabled: true,
      lastFired: ''
    },
    {
      id: 'default-fitness-1',
      role: 'fitness',
      title: 'Hydration & Posture Reset',
      time: '11:00',
      repeatDays: [], // Rings once at 11:00
      sound: 'energize',
      actionPrompt: 'Drink a glass of water, stand up, stretch spine and shoulders.',
      enabled: true,
      lastFired: ''
    }
  ];

  // ==========================================
  // 2. Application State
  // ==========================================
  let alarms = [];
  let currentFilter = 'all';
  let activeRingingAlarm = null;
  let audioContext = null;
  let ringingLoopTimer = null;
  let isMuted = false;

  // ==========================================
  // 3. Web Audio API Sound Synthesizer
  // ==========================================
  function getAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
    return audioContext;
  }

  /**
   * Generates melodic and synthetic tones without external MP3 files
   */
  function playToneProfile(type, volume = 0.8) {
    const ctx = getAudioContext();
    if (!ctx || isMuted) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0.01), 1), now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'study-bell': {
        // Japanese singing bowl / Gong simulation (fundamental + warm harmonics)
        const freqs = [220, 440, 660, 880];
        const decays = [2.2, 1.8, 1.4, 0.9];
        const gains = [0.6, 0.3, 0.15, 0.08];

        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(gains[i], now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + decays[i]);
        });
        break;
      }

      case 'chime': {
        // Soothing Zen pentatonic chime (E5, G5, B5, E6)
        const notes = [659.25, 783.99, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
          const noteTime = now + idx * 0.16;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);

          gain.gain.setValueAtTime(0, noteTime);
          gain.gain.linearRampToValueAtTime(0.4, noteTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(noteTime);
          osc.stop(noteTime + 1.3);
        });
        break;
      }

      case 'digital-pulse': {
        // High crisp digital clock beep pattern: Beep-Beep ... Beep-Beep
        const beeps = [0, 0.12, 0.4, 0.52];
        beeps.forEach(delay => {
          const t = now + delay;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, t); // C6 high beep

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
          gain.gain.setValueAtTime(0.25, t + 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.1);
        });
        break;
      }

      case 'energize': {
        // Uplifting workout arpeggio (C5 - E5 - G5 - C6 - E6)
        const sequence = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        sequence.forEach((freq, idx) => {
          const t = now + idx * 0.09;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.6);
        });
        break;
      }

      case 'siren':
      default: {
        // Urgent 2-tone alarm: 600Hz -> 950Hz oscillation
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.2);
        osc.frequency.linearRampToValueAtTime(650, now + 0.4);
        osc.frequency.linearRampToValueAtTime(950, now + 0.6);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }
    }
  }

  function startRingingAudioLoop(soundType) {
    stopRingingAudioLoop();
    const volumeSlider = document.getElementById('ringingVolume');
    const getVol = () => (volumeSlider ? parseFloat(volumeSlider.value) : 0.85);

    // Play immediately
    playToneProfile(soundType, getVol());

    // Loop interval depending on tone length
    const intervalMap = {
      'study-bell': 2600,
      'chime': 2000,
      'digital-pulse': 1200,
      'energize': 1600,
      'siren': 1100
    };
    const delay = intervalMap[soundType] || 1500;

    ringingLoopTimer = setInterval(() => {
      if (activeRingingAlarm) {
        playToneProfile(soundType, getVol());
      }
    }, delay);
  }

  function stopRingingAudioLoop() {
    if (ringingLoopTimer) {
      clearInterval(ringingLoopTimer);
      ringingLoopTimer = null;
    }
  }

  // ==========================================
  // 4. Time Engine & Clock Tick
  // ==========================================
  function initClock() {
    updateClockDisplay();
    setInterval(updateClockDisplay, 1000);
  }

  function updateClockDisplay() {
    const now = new Date();

    // Digital time formatting
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // 12-hour display
    const displayHours = hours % 12 || 12;
    const timeFormatted12 = `${String(displayHours).padStart(2, '0')}:${minutes}:${seconds}`;

    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const currentAmPmDisplay = document.getElementById('currentAmPmDisplay');
    const currentDateDisplay = document.getElementById('currentDateDisplay');

    if (currentTimeDisplay) currentTimeDisplay.textContent = timeFormatted12;
    if (currentAmPmDisplay) currentAmPmDisplay.textContent = ampm;

    if (currentDateDisplay) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      currentDateDisplay.textContent = now.toLocaleDateString(undefined, options);
    }

    // Check alarm firing match (compare current HH:MM in 24-hr format)
    const currentHHMM = `${String(hours).padStart(2, '0')}:${minutes}`;
    const currentDay = now.getDay();
    const currentSec = now.getSeconds();

    // Check alarms
    checkAlarmTriggers(currentHHMM, currentDay, currentSec);

    // Update countdowns on cards and hero stat
    updateCountdowns(now);
  }

  /**
   * Checks if any active alarm matches current second = 0
   */
  function checkAlarmTriggers(currentHHMM, currentDay, currentSec) {
    if (currentSec !== 0) return; // Only evaluate on the top of the minute to prevent multiple triggers

    alarms.forEach(alarm => {
      if (!alarm.enabled) return;
      if (alarm.time !== currentHHMM) return;

      // Check repeat days
      if (alarm.repeatDays && alarm.repeatDays.length > 0) {
        if (!alarm.repeatDays.includes(currentDay)) {
          return; // Not scheduled for today
        }
      }

      // Check if already fired this minute
      const currentStamp = `${new Date().toDateString()} ${currentHHMM}`;
      if (alarm.lastFired === currentStamp) {
        return;
      }

      // Trigger alarm!
      triggerAlarmRing(alarm, currentStamp);
    });
  }

  /**
   * Trigger the ringing modal and audio
   */
  function triggerAlarmRing(alarm, currentStamp) {
    alarm.lastFired = currentStamp;

    // If one-time alarm (no repeat days), disable it
    if (!alarm.repeatDays || alarm.repeatDays.length === 0) {
      alarm.enabled = false;
    }

    saveAlarms();
    renderAlarms();
    updateStats();

    // Launch ringing dialog
    activeRingingAlarm = alarm;
    const roleConfig = ROLE_CONFIGS[alarm.role] || ROLE_CONFIGS.custom;

    const ringingOverlay = document.getElementById('ringingOverlay');
    const ringingRoleTag = document.getElementById('ringingRoleTag');
    const ringingRoleIcon = document.getElementById('ringingRoleIcon');
    const ringingRoleName = document.getElementById('ringingRoleName');
    const ringingTime = document.getElementById('ringingTime');
    const ringingTitle = document.getElementById('ringingTitle');
    const ringingTipLabel = document.getElementById('ringingTipLabel');
    const ringingTipContent = document.getElementById('ringingTipContent');

    if (ringingRoleIcon) ringingRoleIcon.textContent = roleConfig.icon;
    if (ringingRoleName) ringingRoleName.textContent = `${roleConfig.name} Alarm`;
    if (ringingTime) ringingTime.textContent = format12HourTime(alarm.time);
    if (ringingTitle) ringingTitle.textContent = alarm.title || 'Scheduled Reminder';

    if (ringingTipLabel) ringingTipLabel.textContent = `${roleConfig.name} Focus Checklist`;
    if (ringingTipContent) {
      ringingTipContent.textContent = alarm.actionPrompt || roleConfig.defaultChecklist;
    }

    if (ringingRoleTag) {
      ringingRoleTag.className = `ringing-top-tag role-badge ${alarm.role}`;
    }

    if (ringingOverlay) {
      ringingOverlay.classList.add('active');
      ringingOverlay.setAttribute('aria-hidden', 'false');
    }

    // Play synthesized sound
    startRingingAudioLoop(alarm.sound || roleConfig.defaultSound);

    // Browser Notification
    sendBrowserNotification(alarm, roleConfig);
  }

  /**
   * Sends browser push notification if permitted
   */
  function sendBrowserNotification(alarm, roleConfig) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(`⏰ ${roleConfig.name} Alarm: ${alarm.title}`, {
          body: alarm.actionPrompt || roleConfig.defaultChecklist,
          icon: 'favicon.ico',
          tag: `alarm-${alarm.id}`
        });
      } catch (e) {
        console.log('Notification delivery failed:', e);
      }
    }
  }

  // ==========================================
  // 5. Countdown Calculations
  // ==========================================
  /**
   * Calculates milliseconds until the next occurrence of an alarm
   */
  function getMsUntilNextOccurrence(alarm, now) {
    if (!alarm.enabled) return Infinity;

    const [targetHour, targetMin] = alarm.time.split(':').map(Number);
    const targetDate = new Date(now.getTime());
    targetDate.setHours(targetHour, targetMin, 0, 0);

    const hasRepeatDays = alarm.repeatDays && alarm.repeatDays.length > 0;

    if (!hasRepeatDays) {
      // One-time alarm
      if (targetDate.getTime() <= now.getTime()) {
        // Target time already passed today, schedules for tomorrow
        targetDate.setDate(targetDate.getDate() + 1);
      }
      return targetDate.getTime() - now.getTime();
    } else {
      // Repeating alarm on specific days of the week
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const testDate = new Date(now.getTime());
        testDate.setDate(testDate.getDate() + dayOffset);
        testDate.setHours(targetHour, targetMin, 0, 0);

        if (alarm.repeatDays.includes(testDate.getDay())) {
          if (testDate.getTime() > now.getTime()) {
            return testDate.getTime() - now.getTime();
          }
        }
      }
      // If none found in 7 days, fallback to next week
      return 7 * 24 * 3600 * 1000;
    }
  }

  function formatCountdown(ms) {
    if (!isFinite(ms) || ms < 0) return '--:--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }
    return `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }

  function updateCountdowns(now) {
    let earliestMs = Infinity;
    let nextAlarm = null;

    alarms.forEach(alarm => {
      const msUntil = getMsUntilNextOccurrence(alarm, now);
      const badgeEl = document.getElementById(`countdown-${alarm.id}`);
      if (badgeEl) {
        if (!alarm.enabled) {
          badgeEl.textContent = 'Off';
          badgeEl.style.opacity = '0.5';
        } else {
          badgeEl.textContent = `in ${formatCountdown(msUntil)}`;
          badgeEl.style.opacity = '1';
        }
      }

      if (alarm.enabled && msUntil < earliestMs) {
        earliestMs = msUntil;
        nextAlarm = alarm;
      }
    });

    const nextAlarmCountdown = document.getElementById('nextAlarmCountdown');
    const nextAlarmLabel = document.getElementById('nextAlarmLabel');

    if (nextAlarmCountdown && nextAlarmLabel) {
      if (nextAlarm && isFinite(earliestMs)) {
        nextAlarmCountdown.textContent = formatCountdown(earliestMs);
        nextAlarmLabel.textContent = `${ROLE_CONFIGS[nextAlarm.role]?.icon || '⏰'} ${nextAlarm.title}`;
      } else {
        nextAlarmCountdown.textContent = '--:--:--';
        nextAlarmLabel.textContent = 'No active alarms';
      }
    }
  }

  // ==========================================
  // 6. UI Rendering & DOM Operations
  // ==========================================
  function renderAlarms() {
    const listContainer = document.getElementById('alarmsList');
    const emptyState = document.getElementById('emptyState');
    const countDetail = document.getElementById('alarmCountDetail');

    if (!listContainer) return;

    // Filter alarms
    const filtered = alarms.filter(a => {
      if (currentFilter === 'all') return true;
      return a.role === currentFilter;
    });

    if (countDetail) {
      countDetail.textContent = `Showing ${filtered.length} of ${alarms.length} alarms`;
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = '';
      if (emptyState) emptyState.classList.add('visible');
      return;
    }

    if (emptyState) emptyState.classList.remove('visible');

    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    listContainer.innerHTML = filtered.map(alarm => {
      const roleConfig = ROLE_CONFIGS[alarm.role] || ROLE_CONFIGS.custom;
      const isRepeatAllWeek = alarm.repeatDays && alarm.repeatDays.length === 7;
      const isOneTime = !alarm.repeatDays || alarm.repeatDays.length === 0;

      const dayChipsHtml = dayLabels.map((lbl, idx) => {
        const isActive = alarm.repeatDays && alarm.repeatDays.includes(idx);
        return `<span class="day-dot ${isActive ? 'active' : ''}">${lbl}</span>`;
      }).join('');

      return `
        <article class="alarm-card role-${alarm.role} ${alarm.enabled ? '' : 'disabled'}" data-id="${alarm.id}">
          <div class="card-top-row">
            <span class="role-badge ${alarm.role}">
              <span>${roleConfig.icon}</span>
              <span>${roleConfig.name}</span>
            </span>

            <label class="switch" title="Toggle Alarm Active State">
              <input type="checkbox" class="alarm-toggle" data-id="${alarm.id}" ${alarm.enabled ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>

          <div class="card-time-row">
            <span class="alarm-time-text">${format12HourTime(alarm.time)}</span>
            <span class="alarm-countdown-badge" id="countdown-${alarm.id}">Calculating...</span>
          </div>

          <div class="alarm-title-text">${escapeHtml(alarm.title)}</div>

          ${alarm.actionPrompt ? `
            <div class="alarm-checklist-text">
              <strong>Checklist:</strong> ${escapeHtml(alarm.actionPrompt)}
            </div>
          ` : ''}

          <div class="card-bottom-row">
            <div class="alarm-repeat-days" title="${isRepeatAllWeek ? 'Every day' : isOneTime ? 'Rings once' : 'Repeating days'}">
              ${isOneTime ? '<span class="stat-subtext">Rings Once</span>' : dayChipsHtml}
            </div>

            <div class="card-action-buttons">
              <button class="btn-card-action edit" data-action="edit" data-id="${alarm.id}" title="Edit Alarm" aria-label="Edit Alarm">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="btn-card-action test" data-action="test" data-id="${alarm.id}" title="Test Ring Sound" aria-label="Test Alarm">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <button class="btn-card-action delete" data-action="delete" data-id="${alarm.id}" title="Delete Alarm" aria-label="Delete Alarm">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach card event listeners
    attachCardListeners(listContainer);
  }

  function attachCardListeners(container) {
    // Toggles
    container.querySelectorAll('.alarm-toggle').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        toggleAlarmState(id, e.target.checked);
      });
    });

    // Card buttons (edit, test, delete)
    container.querySelectorAll('.btn-card-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');
        const alarm = alarms.find(a => a.id === id);
        if (!alarm) return;

        if (action === 'edit') {
          openEditAlarmModal(alarm);
        } else if (action === 'delete') {
          deleteAlarm(id);
        } else if (action === 'test') {
          playToneProfile(alarm.sound, 0.85);
          showToast(`Playing "${alarm.sound}" sound preview`, 'info');
        }
      });
    });
  }

  function updateStats() {
    // Role filter counts
    const counts = { all: alarms.length, study: 0, sleep: 0, work: 0, fitness: 0, custom: 0 };
    const enabledRoles = new Set();
    let enabledCount = 0;

    alarms.forEach(a => {
      if (counts[a.role] !== undefined) counts[a.role]++;
      if (a.enabled) {
        enabledRoles.add(a.role);
        enabledCount++;
      }
    });

    document.getElementById('countAll').textContent = counts.all;
    document.getElementById('countStudy').textContent = counts.study;
    document.getElementById('countSleep').textContent = counts.sleep;
    document.getElementById('countWork').textContent = counts.work;
    document.getElementById('countFitness').textContent = counts.fitness;
    document.getElementById('countCustom').textContent = counts.custom;

    const activeCountEl = document.getElementById('activeAlarmsCount');
    if (activeCountEl) {
      activeCountEl.textContent = `${enabledCount} active alarms`;
    }

    const pillsRow = document.getElementById('activeRolesPills');
    if (pillsRow) {
      if (enabledRoles.size === 0) {
        pillsRow.innerHTML = '<span class="role-pill-sm all">None active</span>';
      } else {
        pillsRow.innerHTML = Array.from(enabledRoles).map(role => {
          const cfg = ROLE_CONFIGS[role] || ROLE_CONFIGS.custom;
          return `<span class="role-pill-sm ${role}">${cfg.icon} ${cfg.name}</span>`;
        }).join('');
      }
    }
  }

  // ==========================================
  // 7. Alarm CRUD & Storage
  // ==========================================
  function loadAlarms() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        alarms = JSON.parse(stored);
      } else {
        // First load with starter alarms
        alarms = DEFAULT_ALARMS;
        saveAlarms();
      }
    } catch (e) {
      console.error('Failed to load alarms from localStorage:', e);
      alarms = DEFAULT_ALARMS;
    }
  }

  function saveAlarms() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
    } catch (e) {
      console.error('Failed to save alarms:', e);
    }
  }

  function toggleAlarmState(id, isEnabled) {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
      alarm.enabled = isEnabled;
      saveAlarms();
      renderAlarms();
      updateStats();
      showToast(
        `Alarm "${alarm.title}" turned ${isEnabled ? 'ON' : 'OFF'}`,
        isEnabled ? 'success' : 'info'
      );
    }
  }

  function deleteAlarm(id) {
    const alarm = alarms.find(a => a.id === id);
    if (!alarm) return;

    if (confirm(`Delete the "${alarm.title}" alarm?`)) {
      alarms = alarms.filter(a => a.id !== id);
      saveAlarms();
      renderAlarms();
      updateStats();
      showToast(`Alarm deleted`, 'warning');
    }
  }

  // ==========================================
  // 8. Modal & Creation Workflow
  // ==========================================
  function openNewAlarmModal(rolePreset = 'study', titlePreset = '', timeOffsetMinutes = 25) {
    const modal = document.getElementById('alarmModal');
    const modalTitle = document.getElementById('modalTitle');
    const editAlarmId = document.getElementById('editAlarmId');
    const alarmForm = document.getElementById('alarmForm');

    alarmForm.reset();
    editAlarmId.value = '';
    modalTitle.textContent = 'Set New Alarm';

    // Set Role Radio
    const roleRadio = document.querySelector(`input[name="alarmRole"][value="${rolePreset}"]`);
    if (roleRadio) roleRadio.checked = true;

    // Set Title
    document.getElementById('alarmTitle').value = titlePreset || getDefaultTitleForRole(rolePreset);

    // Compute Target Time (Now + offset)
    const now = new Date();
    now.setMinutes(now.getMinutes() + timeOffsetMinutes);
    const targetHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    document.getElementById('alarmTime').value = targetHHMM;

    // Set default sound & checklist
    const roleCfg = ROLE_CONFIGS[rolePreset] || ROLE_CONFIGS.study;
    document.getElementById('alarmTone').value = roleCfg.defaultSound;
    document.getElementById('alarmActionPrompt').value = roleCfg.defaultChecklist;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.getElementById('alarmTitle').focus();
  }

  function openEditAlarmModal(alarm) {
    const modal = document.getElementById('alarmModal');
    const modalTitle = document.getElementById('modalTitle');
    const editAlarmId = document.getElementById('editAlarmId');

    modalTitle.textContent = 'Edit Alarm';
    editAlarmId.value = alarm.id;

    // Set Role Radio
    const roleRadio = document.querySelector(`input[name="alarmRole"][value="${alarm.role}"]`);
    if (roleRadio) roleRadio.checked = true;

    document.getElementById('alarmTitle').value = alarm.title;
    document.getElementById('alarmTime').value = alarm.time;
    document.getElementById('alarmTone').value = alarm.sound || 'study-bell';
    document.getElementById('alarmActionPrompt').value = alarm.actionPrompt || '';

    // Repeat Days checkboxes
    const dayCheckboxes = document.querySelectorAll('input[name="repeatDay"]');
    dayCheckboxes.forEach(chk => {
      const val = parseInt(chk.value, 10);
      chk.checked = alarm.repeatDays ? alarm.repeatDays.includes(val) : false;
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    const modal = document.getElementById('alarmModal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function handleAlarmFormSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('editAlarmId').value;
    const role = document.querySelector('input[name="alarmRole"]:checked')?.value || 'study';
    const title = document.getElementById('alarmTitle').value.trim() || 'Reminder Alarm';
    const time = document.getElementById('alarmTime').value;
    const sound = document.getElementById('alarmTone').value;
    const actionPrompt = document.getElementById('alarmActionPrompt').value.trim();

    // Collect repeat days
    const repeatDays = [];
    document.querySelectorAll('input[name="repeatDay"]:checked').forEach(chk => {
      repeatDays.push(parseInt(chk.value, 10));
    });

    if (editId) {
      // Editing existing alarm
      const alarm = alarms.find(a => a.id === editId);
      if (alarm) {
        alarm.role = role;
        alarm.title = title;
        alarm.time = time;
        alarm.sound = sound;
        alarm.actionPrompt = actionPrompt;
        alarm.repeatDays = repeatDays;
        alarm.enabled = true; // Auto re-enable when edited
        alarm.lastFired = '';
        showToast(`Alarm "${title}" updated!`, 'success');
      }
    } else {
      // Creating new alarm
      const newAlarm = {
        id: 'alarm-' + Date.now(),
        role,
        title,
        time,
        sound,
        actionPrompt,
        repeatDays,
        enabled: true,
        lastFired: ''
      };
      alarms.unshift(newAlarm);
      showToast(`Alarm scheduled for ${format12HourTime(time)}!`, 'success');
    }

    saveAlarms();
    renderAlarms();
    updateStats();
    closeModal();
  }

  function getDefaultTitleForRole(role) {
    switch (role) {
      case 'study': return 'Focus Study Session';
      case 'sleep': return 'Bedtime Routine / Sleep';
      case 'work': return 'Sprint Task & Standup';
      case 'fitness': return 'Water & Stretch Break';
      case 'custom': default: return 'Scheduled Milestone';
    }
  }

  // ==========================================
  // 9. Presets Handler
  // ==========================================
  function handlePresetClick(presetType) {
    const now = new Date();

    switch (presetType) {
      case 'study-pomodoro': {
        now.setMinutes(now.getMinutes() + 25);
        createInstantPresetAlarm('study', 'Study Focus Block (25m)', now, 'study-bell', 'Turn off notifications, work on your key topic.');
        break;
      }
      case 'study-deep': {
        now.setMinutes(now.getMinutes() + 50);
        createInstantPresetAlarm('study', 'Deep Revision Sprint (50m)', now, 'study-bell', 'Complete your problem set or chapter without interruptions.');
        break;
      }
      case 'sleep-powernap': {
        now.setMinutes(now.getMinutes() + 20);
        createInstantPresetAlarm('sleep', '20-Minute Power Nap', now, 'chime', 'Close eyes, breathe calmly, wake up recharged.');
        break;
      }
      case 'sleep-night': {
        // Today 10:30 PM (or tomorrow if already past)
        const bedtime = new Date();
        bedtime.setHours(22, 30, 0, 0);
        createInstantPresetAlarm('sleep', 'Night Bedtime Routine', bedtime, 'chime', 'Dim room lights, disconnect devices, get restorative sleep.');
        break;
      }
      case 'work-standup': {
        now.setMinutes(now.getMinutes() + 60);
        createInstantPresetAlarm('work', 'Work Standup & Sync', now, 'digital-pulse', 'Check Jira board, review tasks, and prepare updates.');
        break;
      }
      case 'fitness-stretch': {
        now.setMinutes(now.getMinutes() + 45);
        createInstantPresetAlarm('fitness', 'Posture & Hydration Break', now, 'energize', 'Drink a full glass of water, stretch spine, step outside for fresh air.');
        break;
      }
    }
  }

  function createInstantPresetAlarm(role, title, dateObj, sound, prompt) {
    const timeHHMM = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

    const newAlarm = {
      id: 'preset-' + Date.now(),
      role,
      title,
      time: timeHHMM,
      sound,
      actionPrompt: prompt,
      repeatDays: [],
      enabled: true,
      lastFired: ''
    };

    alarms.unshift(newAlarm);
    saveAlarms();
    renderAlarms();
    updateStats();
    showToast(`Quick preset added: ${title} at ${format12HourTime(timeHHMM)}`, 'success');
  }

  // ==========================================
  // 10. Ringing Overlay Controls (Snooze / Dismiss)
  // ==========================================
  function snoozeCurrentAlarm(minutes) {
    if (!activeRingingAlarm) return;

    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const newTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Update alarm time or create snooze reminder
    activeRingingAlarm.time = newTime;
    activeRingingAlarm.enabled = true;
    activeRingingAlarm.lastFired = '';

    saveAlarms();
    renderAlarms();
    updateStats();

    dismissRingingScreen();
    showToast(`Snoozed for ${minutes} minutes (rings at ${format12HourTime(newTime)})`, 'info');
  }

  function dismissRingingScreen() {
    stopRingingAudioLoop();
    activeRingingAlarm = null;

    const ringingOverlay = document.getElementById('ringingOverlay');
    if (ringingOverlay) {
      ringingOverlay.classList.remove('active');
      ringingOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  // ==========================================
  // 11. Toast Notifications
  // ==========================================
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3200);
  }

  // ==========================================
  // 12. Helpers & Utilities
  // ==========================================
  function format12HourTime(time24) {
    if (!time24) return '--:--';
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 13. Initialization & Event Binding
  // ==========================================
  document.addEventListener('DOMContentLoaded', () => {
    // Theme Management
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    themeToggleBtn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(THEME_KEY, next);
      showToast(`Switched to ${next} theme`, 'info');
    });

    // Browser Notification Permission Button
    const notifyBtn = document.getElementById('notifyBtn');
    const notifyBtnText = document.getElementById('notifyBtnText');

    function updateNotifyBtnState() {
      if (!('Notification' in window)) {
        if (notifyBtnText) notifyBtnText.textContent = 'Alerts: Unsupported';
        return;
      }
      if (Notification.permission === 'granted') {
        notifyBtn?.classList.add('active');
        if (notifyBtnText) notifyBtnText.textContent = 'Alerts: On';
      } else {
        notifyBtn?.classList.remove('active');
        if (notifyBtnText) notifyBtnText.textContent = 'Alerts: Off';
      }
    }

    notifyBtn?.addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showToast('Browser notifications are not supported in this browser.', 'warning');
        return;
      }
      const permission = await Notification.requestPermission();
      updateNotifyBtnState();
      if (permission === 'granted') {
        showToast('Browser notifications activated for alarms!', 'success');
      } else {
        showToast('Notifications permission not granted.', 'warning');
      }
    });
    updateNotifyBtnState();

    // Timezone string
    const tzEl = document.getElementById('currentTimezone');
    if (tzEl) {
      try {
        const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
        tzEl.textContent = `${tzName} Timezone`;
      } catch (e) {
        tzEl.textContent = 'Local Time';
      }
    }

    // Role Filter Bar Buttons
    const filterButtons = document.querySelectorAll('.filter-chip');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderAlarms();
      });
    });

    // Preset Buttons
    document.querySelectorAll('.preset-card').forEach(card => {
      card.addEventListener('click', () => {
        const preset = card.getAttribute('data-preset');
        handlePresetClick(preset);
      });
    });

    // Modal Triggers
    const openNewAlarmBtn = document.getElementById('openNewAlarmBtn');
    const emptyStateCreateBtn = document.getElementById('emptyStateCreateBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const alarmForm = document.getElementById('alarmForm');

    openNewAlarmBtn?.addEventListener('click', () => openNewAlarmModal('study'));
    emptyStateCreateBtn?.addEventListener('click', () => openNewAlarmModal('study'));
    closeModalBtn?.addEventListener('click', closeModal);
    cancelModalBtn?.addEventListener('click', closeModal);
    alarmForm?.addEventListener('submit', handleAlarmFormSubmit);

    // Modal Role Selector change listener -> auto updates default sound & checklist
    document.querySelectorAll('input[name="alarmRole"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const selectedRole = e.target.value;
        const roleCfg = ROLE_CONFIGS[selectedRole];
        if (roleCfg) {
          const soundSelect = document.getElementById('alarmTone');
          const promptInput = document.getElementById('alarmActionPrompt');
          if (soundSelect && !document.getElementById('editAlarmId').value) {
            soundSelect.value = roleCfg.defaultSound;
          }
          if (promptInput && !document.getElementById('editAlarmId').value) {
            promptInput.value = roleCfg.defaultChecklist;
          }
        }
      });
    });

    // Quick Time Buttons (+5m, +15m, +30m, +1h) inside the form
    document.querySelectorAll('.btn-time-quick').forEach(btn => {
      btn.addEventListener('click', () => {
        const addMinutes = parseInt(btn.getAttribute('data-add'), 10);
        const timeInput = document.getElementById('alarmTime');
        const now = new Date();
        if (timeInput.value) {
          const [h, m] = timeInput.value.split(':').map(Number);
          now.setHours(h, m + addMinutes, 0, 0);
        } else {
          now.setMinutes(now.getMinutes() + addMinutes);
        }
        timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      });
    });

    // Sound Listen / Preview Button in Form
    const previewToneBtn = document.getElementById('previewToneBtn');
    previewToneBtn?.addEventListener('click', () => {
      const soundSelect = document.getElementById('alarmTone');
      const sound = soundSelect ? soundSelect.value : 'study-bell';
      playToneProfile(sound, 0.85);
      showToast(`Playing "${sound}" tone`, 'info');
    });

    // Ringing Overlay: Snooze & Dismiss buttons
    document.querySelectorAll('.btn-snooze').forEach(btn => {
      btn.addEventListener('click', () => {
        const mins = parseInt(btn.getAttribute('data-snooze'), 10);
        snoozeCurrentAlarm(mins);
      });
    });

    const dismissAlarmBtn = document.getElementById('dismissAlarmBtn');
    dismissAlarmBtn?.addEventListener('click', dismissRingingScreen);

    // Mute/Unmute toggle in Ringing Screen
    const silenceAudioBtn = document.getElementById('silenceAudioBtn');
    silenceAudioBtn?.addEventListener('click', () => {
      isMuted = !isMuted;
      silenceAudioBtn.textContent = isMuted ? 'Unmute Sound' : 'Mute Sound';
      silenceAudioBtn.style.color = isMuted ? 'var(--danger)' : '';
      showToast(isMuted ? 'Sound muted' : 'Sound unmuted', 'info');
    });

    // Test Alarm Sample Button (Allows user to test and preview the ringing experience immediately!)
    const testAlarmSampleBtn = document.getElementById('testAlarmSampleBtn');
    testAlarmSampleBtn?.addEventListener('click', () => {
      const mockAlarm = {
        id: 'test-sample',
        role: 'study',
        title: 'Study Focus Block (Interactive Demo)',
        time: `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
        sound: 'study-bell',
        actionPrompt: 'Focus Checklist: Turn off notifications, have water nearby, open chapter summary.',
        repeatDays: [],
        enabled: true,
        lastFired: ''
      };
      triggerAlarmRing(mockAlarm, 'demo');
    });

    // Resume AudioContext on any first user interaction
    document.addEventListener('pointerdown', () => getAudioContext(), { once: true });
    document.addEventListener('keydown', () => getAudioContext(), { once: true });

    // Initial Load
    loadAlarms();
    renderAlarms();
    updateStats();
    initClock();

    // Check URL params for automated testing/previews
    if (window.location.search.includes('testRing=1')) {
      setTimeout(() => testAlarmSampleBtn?.click(), 300);
    } else if (window.location.search.includes('testModal=1')) {
      setTimeout(() => openNewAlarmModal('study'), 300);
    }
  });
})();
