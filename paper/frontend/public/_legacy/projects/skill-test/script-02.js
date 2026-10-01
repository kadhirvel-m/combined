// Extracted from ui/projects/skill-test.html (inline <script> #2).
    const qs = new URLSearchParams(location.search);
    const startingSkill = (qs.get('skill') || '').trim();
    const API = ((window.API_BASE || window.__API_BASE || 'http://0.0.0.0:10000')).replace(/\/$/, '');
    const token = localStorage.getItem('px_token');

    if (!token) {
      window.location.href = 'login.html';
    }

    const skillHeading = document.getElementById('skillHeading');
    const statusMsg = document.getElementById('statusMsg');
    const regenerateBtn = document.getElementById('regenerateBtn');
    const submitBtn = document.getElementById('submitBtn');
    const questionsSection = document.getElementById('questionsSection');
    const resultCard = document.getElementById('resultCard');
    const resultScore = document.getElementById('resultScore');
    const resultStatusBadge = document.getElementById('resultStatusBadge');
    const resultStatus = document.getElementById('resultStatus');
    const resultMessage = document.getElementById('resultMessage');
    const resultBar = document.getElementById('resultBar');
    const resultDetails = document.getElementById('resultDetails');
    const skillChooser = document.getElementById('skillChooser');
    const skillInput = document.getElementById('skillInput');

    const proctorVideo = document.getElementById('proctorVideo');
    const enableProctorBtn = document.getElementById('enableProctorBtn');
    const proctorAlert = document.getElementById('proctorAlert');
    const proctorAlertText = document.getElementById('proctorAlertText');
    const statusFace = document.getElementById('statusFace');
    const statusGaze = document.getElementById('statusGaze');
    const statusMulti = document.getElementById('statusMulti');
    const statusNoise = document.getElementById('statusNoise');

    let state = {
      sessionId: null,
      skill: startingSkill,
      questions: [],
      loading: false,
    };

    const warningMap = new Map();
    let proctorStream = null;
    let faceMesh = null;
    let proctoringActive = false;
    let startingProctor = false;
    let lastFaceTimestamp = performance.now();
    let lastNoiseTimestamp = 0;

    const setStatusIndicator = (element, level, message) => {
      if (!element) return;
      element.textContent = message;
      element.classList.remove('status-ok', 'status-warn', 'status-error', 'status-info');
      const cls = level === 'ok' ? 'status-ok' : level === 'warn' ? 'status-warn' : level === 'error' ? 'status-error' : 'status-info';
      element.classList.add(cls);
    };

    setStatusIndicator(statusFace, 'info', 'Camera idle…');
    setStatusIndicator(statusGaze, 'info', 'Awaiting calibration…');
    setStatusIndicator(statusMulti, 'info', 'Only you should be visible.');
    setStatusIndicator(statusNoise, 'info', 'Listening for background audio…');

    const updateAlert = () => {
      if (!proctorAlert) return;
      if (warningMap.size) {
        const message = Array.from(warningMap.values()).join(' • ');
        proctorAlertText.textContent = message;
        proctorAlert.classList.add('show');
        proctorAlert.classList.remove('hidden');
      } else {
        proctorAlertText.textContent = '';
        proctorAlert.classList.remove('show');
        proctorAlert.classList.add('hidden');
      }
    };

    const raiseWarning = (key, message) => {
      warningMap.set(key, message);
      updateAlert();
    };

    const clearWarning = (key) => {
      if (warningMap.delete(key)) {
        updateAlert();
      }
    };

    document.getElementById('mobileToggle').addEventListener('click', () => {
      document.getElementById('mobileNav').classList.toggle('hidden');
    });

    const setBannerStatus = (message, tone = 'info') => {
      statusMsg.textContent = message || '';
      const toneClass = tone === 'error' ? 'text-red-500' : tone === 'success' ? 'text-emerald-500' : 'text-black/70 dark:text-white/70';
      statusMsg.className = `mt-4 text-sm ${toneClass}`;
    };

    const letterForOption = (optionText, index) => {
      if (!optionText) return String.fromCharCode(65 + index);
      const match = optionText.trim().match(/^([A-D])/i);
      return match ? match[1].toUpperCase() : String.fromCharCode(65 + index);
    };

    const createCeqCard = (question, index) => {
      const card = document.createElement('article');
      card.className = 'lift rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 p-5 space-y-4';
      card.dataset.kind = 'ceq';
      card.dataset.questionId = question.id;

      const header = document.createElement('div');
      header.className = 'flex items-start justify-between gap-2';
      header.innerHTML = `<div><p class="text-xs uppercase tracking-wide text-brand-600">Question ${index + 1}</p><h3 class="text-lg font-semibold">Conceptual Check</h3></div><span class="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-600">CEQ</span>`;
      card.appendChild(header);

      const prompt = document.createElement('p');
      prompt.className = 'text-sm md:text-base text-black/80 dark:text-white/70';
      prompt.textContent = question.prompt;
      card.appendChild(prompt);

      const optionsWrap = document.createElement('div');
      optionsWrap.className = 'grid gap-2';
      (question.options || []).forEach((option, optIndex) => {
        const letter = letterForOption(option, optIndex);
        const optionId = `q-${question.id}-${letter}`;
        const label = document.createElement('label');
        label.htmlFor = optionId;
        label.className = 'flex items-center gap-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 px-3 py-2 cursor-pointer hover:border-brand-500';
        label.innerHTML = `<input type="radio" class="accent-brand-600" name="q-${question.id}" id="${optionId}" value="${letter}" /> <span>${option}</span>`;
        optionsWrap.appendChild(label);
      });
      card.appendChild(optionsWrap);

      return card;
    };

    const createCodingCard = (question, index) => {
      const card = document.createElement('article');
      card.className = 'lift rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 p-5 space-y-4';
      card.dataset.kind = 'coding';
      card.dataset.questionId = question.id;

      const badgeLabel = question.language ? question.language.toUpperCase() : 'Coding';
      const header = document.createElement('div');
      header.className = 'flex items-start justify-between gap-2';
      header.innerHTML = `<div><p class="text-xs uppercase tracking-wide text-brand-600">Question ${index + 1}</p><h3 class="text-lg font-semibold">Hands-on Challenge</h3></div><span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">${badgeLabel}</span>`;
      card.appendChild(header);

      const prompt = document.createElement('p');
      prompt.className = 'text-sm md:text-base text-black/80 dark:text-white/70 whitespace-pre-line';
      prompt.textContent = question.prompt;
      card.appendChild(prompt);

      const textarea = document.createElement('textarea');
      textarea.name = `q-${question.id}`;
      textarea.rows = 10;
      textarea.placeholder = question.language ? `Write your ${question.language} solution here...` : 'Write your solution here...';
      textarea.className = 'w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 focus:border-brand-500 focus:ring-brand-500 text-sm font-mono';
      card.appendChild(textarea);

      const helper = document.createElement('p');
      helper.className = 'text-xs text-black/60 dark:text-white/50';
      helper.textContent = 'Tip: include a small explanation or test so the AI can evaluate context.';
      card.appendChild(helper);

      return card;
    };

    const renderQuestions = () => {
      questionsSection.innerHTML = '';
      resultCard.classList.add('hidden');
      submitBtn.disabled = !state.sessionId || !state.questions.length || state.loading;
      regenerateBtn.disabled = state.loading;
      if (state.questions.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-white/60 dark:bg-zinc-900/60 p-6 text-sm text-black/60 dark:text-white/60';
        empty.textContent = 'Your assessment will appear here once generated.';
        questionsSection.appendChild(empty);
        return;
      }

      state.questions.forEach((question, index) => {
        if (question.kind === 'ceq') {
          questionsSection.appendChild(createCeqCard(question, index));
        } else {
          questionsSection.appendChild(createCodingCard(question, index));
        }
      });
    };

    const startAssessment = async (skill) => {
      state.loading = true;
      submitBtn.disabled = true;
      regenerateBtn.disabled = true;
      setBannerStatus(`Preparing fresh questions for ${skill}…`, 'info');
      try {
        const res = await fetch(`${API}/api/skills/tests/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ skill })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.detail || 'Unable to start assessment');
        state = {
          sessionId: payload.session_id,
          skill: payload.skill,
          questions: payload.questions || [],
          loading: false,
        };
        skillHeading.textContent = `Verify: ${state.skill}`;
        regenerateBtn.classList.remove('hidden');
        regenerateBtn.disabled = false;
        setBannerStatus('Answer the questions below and click submit when ready.', 'info');
        renderQuestions();
        ensureProctoring();
      } catch (err) {
        console.error(err);
        setBannerStatus(err.message || 'Unable to start assessment.', 'error');
        state.loading = false;
        renderQuestions();
      }
    };

    const gatherAnswers = () => {
      const answers = [];
      let missing = [];
      state.questions.forEach((question) => {
        if (question.kind === 'ceq') {
          const selected = document.querySelector(`input[name="q-${question.id}"]:checked`);
          if (!selected) {
            missing.push(question.id);
          } else {
            answers.push({ question_id: question.id, response: selected.value });
          }
        } else {
          const textarea = document.querySelector(`textarea[name="q-${question.id}"]`);
          const value = (textarea?.value || '').trim();
          if (!value) {
            missing.push(question.id);
          } else {
            answers.push({ question_id: question.id, response: value });
          }
        }
      });
      return { answers, missing };
    };

    const renderResult = (result) => {
      resultCard.classList.remove('hidden');
      const score = Math.round(result.score || 0);
      resultScore.textContent = `${score}%`;
      resultBar.style.width = `${Math.min(100, Math.max(0, score))}%`;
      const verified = result.status === 'verified';
      resultStatus.textContent = verified ? 'Verified' : 'Needs review';
      resultStatusBadge.className = `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${verified ? 'bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-200' : 'bg-amber-500/20 text-amber-700 dark:bg-amber-500/25 dark:text-amber-200'}`;
      resultStatusBadge.querySelector('.icon').textContent = verified ? 'verified' : 'pending';
      resultMessage.textContent = verified ? 'Great work! Your profile reflects this verification.' : 'Retake the test to improve your score.';

      resultDetails.innerHTML = '';
      (result.details || []).forEach(detail => {
        const row = document.createElement('p');
        row.textContent = `${detail.kind === 'ceq' ? 'Conceptual' : 'Coding'} • ${Math.round(detail.score)}% • ${detail.feedback}`;
        resultDetails.appendChild(row);
      });
    };

    submitBtn.addEventListener('click', async () => {
      if (!state.sessionId) {
        setBannerStatus('Generate questions before submitting.', 'error');
        return;
      }
      const { answers, missing } = gatherAnswers();
      if (missing.length) {
        setBannerStatus('Please answer every question before submitting.', 'error');
        return;
      }
      submitBtn.disabled = true;
      setBannerStatus('Scoring your answers with AI…', 'info');
      try {
        const res = await fetch(`${API}/api/skills/tests/${state.sessionId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ answers })
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(payload.detail || 'Submission failed');
        renderResult(payload);
        setBannerStatus('Assessment complete! You can retake to aim higher.', 'success');
      } catch (err) {
        console.error(err);
        setBannerStatus(err.message || 'Unable to submit answers.', 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });

    regenerateBtn.addEventListener('click', () => {
      if (state.loading) return;
      startAssessment(state.skill);
    });

    skillChooser.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = (skillInput.value || '').trim();
      if (!value) return;
      state.skill = value;
      startAssessment(value);
    });

    if (startingSkill) {
      skillChooser.classList.add('hidden');
      startAssessment(startingSkill);
    } else {
      skillChooser.classList.remove('hidden');
      setBannerStatus('Enter a skill to begin your verification test.', 'info');
      skillInput.focus();
    }

    const ensureProctoring = (force = false) => {
      if (proctoringActive || startingProctor) return;
      if (force || document.visibilityState === 'visible') {
        startProctoring();
      }
    };

    const startProctoring = async () => {
      startingProctor = true;
      setStatusIndicator(statusFace, 'info', 'Requesting camera access…');
      try {
        proctorStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: true,
        });
        proctorVideo.srcObject = proctorStream;
        proctorVideo.muted = true;
        await proctorVideo.play().catch(() => { });
        enableProctorBtn?.classList.add('hidden');
        clearWarning('proctor-permission');
        setStatusIndicator(statusFace, 'info', 'Calibrating…');
        setupFaceTracking();
        setupAudioMonitoring();
        proctoringActive = true;
        startingProctor = false;
      } catch (err) {
        console.error('Proctoring failed', err);
        startingProctor = false;
        setStatusIndicator(statusFace, 'error', 'Camera permission denied. Click enable to retry.');
        raiseWarning('proctor-permission', 'Camera/Mic permission is required for verification.');
        enableProctorBtn?.classList.remove('hidden');
      }
    };

    const setupFaceTracking = () => {
      if (!window.FaceMesh) {
        if (!warningMap.has('face-support')) {
          setStatusIndicator(statusFace, 'warn', 'Face tracking unsupported in this browser.');
          raiseWarning('face-support', 'Use a modern Chromium browser to enable face tracking.');
        }
        return;
      }
      clearWarning('face-support');
      faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/${file}` });
      faceMesh.setOptions({ maxNumFaces: 2, refineLandmarks: true, minDetectionConfidence: 0.4, minTrackingConfidence: 0.4 });
      faceMesh.onResults(handleFaceResults);
      const processFrame = async () => {
        if (!proctoringActive) return;
        if (proctorVideo.readyState >= 2) {
          await faceMesh.send({ image: proctorVideo });
        }
        requestAnimationFrame(processFrame);
      };
      processFrame();
    };

    const handleFaceResults = (results) => {
      const now = performance.now();
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length) {
        lastFaceTimestamp = now;
        clearWarning('face-missing');
        setStatusIndicator(statusFace, 'ok', 'Face detected');

        const faces = results.multiFaceLandmarks.length;
        if (faces > 1) {
          raiseWarning('multi-face', 'Multiple faces detected. Work solo.');
          setStatusIndicator(statusMulti, 'error', 'Multiple faces detected');
        } else {
          clearWarning('multi-face');
          setStatusIndicator(statusMulti, 'ok', 'Solo participant confirmed');
        }

        const landmarks = results.multiFaceLandmarks[0];
        const nose = landmarks[1];
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const eyeAvgY = (leftEye.y + rightEye.y) / 2;
        const noseX = nose.x;
        const lookingAway = noseX < 0.30 || noseX > 0.70;
        const lookingDown = eyeAvgY > 0.62;

        if (lookingAway) {
          raiseWarning('gaze', 'Face not centered on screen.');
          setStatusIndicator(statusGaze, 'warn', 'Face not centered on screen');
        } else if (lookingDown) {
          raiseWarning('gaze', 'Eyes appear off-screen.');
          setStatusIndicator(statusGaze, 'warn', 'Eyes appear down/off-screen');
        } else {
          clearWarning('gaze');
          setStatusIndicator(statusGaze, 'ok', 'Focused on screen');
        }
      } else {
        const elapsed = performance.now() - lastFaceTimestamp;
        if (elapsed > 2000) {
          raiseWarning('face-missing', 'Face not detected in frame.');
          setStatusIndicator(statusFace, 'error', 'Face not detected');
          setStatusIndicator(statusGaze, 'warn', 'Awaiting face');
          setStatusIndicator(statusMulti, 'info', 'Only you should be visible.');
        } else {
          setStatusIndicator(statusFace, 'info', 'Stabilizing face tracking…');
        }
      }
    };

    const setupAudioMonitoring = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
          setStatusIndicator(statusNoise, 'warn', 'Audio monitoring unavailable.');
          return;
        }
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(proctorStream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        const buffer = new Float32Array(analyser.fftSize);
        audioContext.resume().catch(() => { });

        const monitor = () => {
          if (!proctoringActive) return;
          analyser.getFloatTimeDomainData(buffer);
          let sum = 0;
          for (let i = 0; i < buffer.length; i += 1) {
            sum += buffer[i] * buffer[i];
          }
          const rms = Math.sqrt(sum / buffer.length);
          const now = performance.now();
          const threshold = 0.06;
          if (rms > threshold) {
            lastNoiseTimestamp = now;
          }
          if (now - lastNoiseTimestamp < 2000) {
            raiseWarning('noise', 'Background audio detected.');
            setStatusIndicator(statusNoise, 'warn', 'Reduce background audio');
          } else {
            clearWarning('noise');
            setStatusIndicator(statusNoise, 'ok', 'Ambient sound normal');
          }
          requestAnimationFrame(monitor);
        };
        monitor();
      } catch (err) {
        console.warn('Audio monitor error', err);
        setStatusIndicator(statusNoise, 'warn', 'Audio monitoring unavailable.');
      }
    };

    enableProctorBtn?.addEventListener('click', () => ensureProctoring(true));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        ensureProctoring();
      }
    });
    window.addEventListener('focus', () => {
      clearWarning('window-blur');
    });
    window.addEventListener('blur', () => {
      raiseWarning('window-blur', 'Browser out of focus. Return to the assessment.');
    });

    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());

    document.addEventListener('click', () => ensureProctoring(), { once: true });
