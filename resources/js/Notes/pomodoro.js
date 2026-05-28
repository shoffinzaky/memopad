let timerInterval = null;
let duration = 25 * 60; // default 25 minutes
let timeLeft = duration;
let isRunning = false;
const circumference = 2 * Math.PI * 100; // 628.318

export function initPomodoro() {
    const pomoStartBtn = document.getElementById('pomo-start');
    const pomoPauseBtn = document.getElementById('pomo-pause');
    const pomoResetBtn = document.getElementById('pomo-reset');
    const tabs = document.querySelectorAll('.pomodoro-tab');

    if (!pomoStartBtn) return;

    // Set initial display
    updateTimerDisplay();
    setProgress(100);

    pomoStartBtn.addEventListener('click', () => {
        startTimer();
    });

    pomoPauseBtn.addEventListener('click', () => {
        pauseTimer();
    });

    pomoResetBtn.addEventListener('click', () => {
        resetTimer();
    });

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const minutes = parseInt(tab.dataset.minutes, 10);
            duration = minutes * 60;
            resetTimer();
        });
    });
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;

    document.getElementById('pomo-start').classList.add('d-none');
    document.getElementById('pomo-pause').classList.remove('d-none');

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        const percent = (timeLeft / duration) * 100;
        setProgress(percent);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;
            playAlarmSound();
            
            // Switch back button visibility
            document.getElementById('pomo-start').classList.remove('d-none');
            document.getElementById('pomo-pause').classList.add('d-none');
            
            alert('Waktu Pomodoro Selesai! Saatnya beristirahat atau kembali fokus.');
            resetTimer();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(timerInterval);
    
    document.getElementById('pomo-start').classList.remove('d-none');
    document.getElementById('pomo-pause').classList.add('d-none');
}

function resetTimer() {
    pauseTimer();
    timeLeft = duration;
    updateTimerDisplay();
    setProgress(100);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timer-display').textContent = formatted;
}

function setProgress(percent) {
    const circle = document.getElementById('timer-progress');
    if (!circle) return;
    const offset = circumference - (percent / 100 * circumference);
    circle.style.strokeDashoffset = offset;
}

function playAlarmSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Tone 1 (C5)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc1.start(audioCtx.currentTime);
        osc1.stop(audioCtx.currentTime + 0.3);

        // Tone 2 (E5)
        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
            osc2.start(audioCtx.currentTime);
            osc2.stop(audioCtx.currentTime + 0.4);
        }, 150);

        // Tone 3 (G5)
        setTimeout(() => {
            const osc3 = audioCtx.createOscillator();
            const gain3 = audioCtx.createGain();
            osc3.connect(gain3);
            gain3.connect(audioCtx.destination);
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(783.99, audioCtx.currentTime);
            gain3.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc3.start(audioCtx.currentTime);
            osc3.stop(audioCtx.currentTime + 0.5);
        }, 300);
    } catch (e) {
        console.error('AudioContext error:', e);
    }
}
