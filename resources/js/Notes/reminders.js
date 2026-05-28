import * as bootstrap from 'bootstrap';
import { updateNote } from './api';

let alarmModal = null;
let alarmInterval = null;
let firedReminderIds = new Set();
let activeAlarmNote = null;
let onNotesRefresh = null;

export function initReminders(refreshCallback) {
    onNotesRefresh = refreshCallback;
    const modalEl = document.getElementById('alarmModal');
    if (!modalEl) return;

    alarmModal = new bootstrap.Modal(modalEl);

    // Bind snooze & complete buttons
    const btnComplete = document.getElementById('btn-alarm-complete');
    const btnSnooze = document.getElementById('btn-alarm-snooze');
    const btnClose = document.getElementById('btn-alarm-close');

    if (btnComplete) {
        btnComplete.addEventListener('click', async () => {
            if (activeAlarmNote) {
                stopAlarmRing();
                alarmModal.hide();
                // Clear reminder in DB
                await updateNote(activeAlarmNote.id, { reminder_at: null });
                if (onNotesRefresh) onNotesRefresh();
            }
        });
    }

    if (btnSnooze) {
        btnSnooze.addEventListener('click', async () => {
            if (activeAlarmNote) {
                stopAlarmRing();
                alarmModal.hide();
                // Snooze 5 minutes (300 seconds)
                const snoozeTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
                // We must remove this ID from fired reminders so it can fire again
                firedReminderIds.delete(activeAlarmNote.id);
                await updateNote(activeAlarmNote.id, { reminder_at: snoozeTime });
                if (onNotesRefresh) onNotesRefresh();
            }
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            stopAlarmRing();
            alarmModal.hide();
        });
    }

    modalEl.addEventListener('hidden.bs.modal', () => {
        stopAlarmRing();
    });
}

export function checkReminders(notes) {
    if (!notes) return;
    const now = new Date();

    for (const note of notes) {
        // Skip if trashed or archived
        if (note.is_trashed || note.is_archived) continue;
        
        if (note.reminder_at) {
            const alarmTime = new Date(note.reminder_at);
            // If the alarm time is in the past (due) and hasn't been fired in this session
            if (alarmTime <= now && !firedReminderIds.has(note.id)) {
                firedReminderIds.add(note.id);
                triggerAlarm(note);
                break; // fire one alarm at a time
            }
        }
    }
}

function triggerAlarm(note) {
    activeAlarmNote = note;
    
    // Set UI contents in alarm modal
    document.getElementById('alarm-title').textContent = note.title || 'Catatan Tanpa Judul';
    document.getElementById('alarm-content').textContent = note.content || '';
    
    alarmModal.show();
    playAlarmRing();
}

function playAlarmRing() {
    if (alarmInterval) return;
    
    const playTone = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 tone
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.8);
            
            // Auto close context to release resources
            setTimeout(() => audioCtx.close(), 1000);
        } catch (e) {
            console.error('AudioContext alarm sound error:', e);
        }
    };
    
    playTone();
    alarmInterval = setInterval(playTone, 1500);
}

function stopAlarmRing() {
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
}
