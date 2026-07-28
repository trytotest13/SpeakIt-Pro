// DOM Elements
const textInput = document.getElementById('text-input');
const charCountDisplay = document.getElementById('char-count');
const wordCountDisplay = document.getElementById('word-count');
const initBtn = document.getElementById('init-btn');
const playerUI = document.getElementById('player-ui');

const playBtnMain = document.getElementById('play-btn-main');
const playIconMain = document.getElementById('play-icon-main');
const stopIconMain = document.getElementById('stop-icon-main');
const playStatusText = document.getElementById('play-status-text');

const prevBtnWrapper = document.getElementById('prev-btn-wrapper');
const nextBtnWrapper = document.getElementById('next-btn-wrapper');

const seekBar = document.getElementById('seek-bar');
const seekFill = document.getElementById('seek-fill');

const volumeSlider = document.getElementById('volume-slider');
const volumeFill = document.getElementById('volume-fill');
const volumeLabel = document.getElementById('volume-label');

const speedControl = document.getElementById('speed-control');
const voiceSelect = document.getElementById('voice-select');

const percentageDisplay = document.getElementById('percentage-display');
const progressText = document.getElementById('progress-text');
const segmentPreview = document.getElementById('current-segment-preview');

// Native Speech Synthesis Setup
const synth = window.speechSynthesis;
let voices = [];
let textChunks = [];
let currentChunkIndex = 0;
let originalText = "";

let isPlaying = false;
let isPaused = false;
let isManualNavigation = false;

// Populate System Voices
function loadVoices() {
    voices = synth.getVoices();
    if (voices.length === 0) return;
    
    const savedVoice = voiceSelect.value;
    voiceSelect.innerHTML = '<option value="">System Default Voice</option>';
    
    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.textContent = `${voice.name} (${voice.lang})`;
        option.value = voice.name;
        voiceSelect.appendChild(option);
    });
    
    if (savedVoice && voices.some(v => v.name === savedVoice)) {
        voiceSelect.value = savedVoice;
    }
}

loadVoices();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
}

// Helpers
function updateSliderFill(slider, fillElement) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percentage = max === min ? 0 : ((val - min) / (max - min)) * 100;
    if (fillElement) fillElement.style.width = `${percentage}%`;
}

updateSliderFill(volumeSlider, volumeFill);

// Track Text Input
textInput.addEventListener('input', () => {
    const text = textInput.value;
    charCountDisplay.textContent = text.length.toLocaleString();
    wordCountDisplay.textContent = (text.trim() === "" ? 0 : text.trim().split(/\s+/).length).toLocaleString();
    
    initBtn.disabled = text.trim() === "";

    if (!playerUI.classList.contains('hidden')) {
        if (text.trim() !== originalText) {
            initBtn.textContent = "Apply Changes & Restart";
            initBtn.classList.remove('hidden');
        } else {
            initBtn.classList.add('hidden');
        }
    }
});

// Robust Chunking Logic (Bypasses Google Chrome's 15-second TTS Bug)
function chunkText(text) {
    const maxLength = 180; const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [text];
    let current = "";
    
    sentences.forEach(s => {
        if ((current + s).length < maxLength) {
            current += (current ? " " : "") + s;
        } else {
            if (current) chunks.push(current.trim());
            if (s.length > maxLength) {
                const words = s.split(' '); let tmp = "";
                words.forEach(w => {
                    if ((tmp + w).length < maxLength) {
                        tmp += (tmp ? " " : "") + w;
                    } else { 
                        if (tmp) chunks.push(tmp.trim()); 
                        tmp = w; 
                    }
                });
                current = tmp;
            } else current = s;
        }
    });
    if (current) chunks.push(current.trim());
    return chunks.filter(c => c.length > 0);
}

function updateProgressUI() {
    progressText.textContent = `Part ${currentChunkIndex + 1} of ${textChunks.length}`;
    segmentPreview.textContent = `"${textChunks[currentChunkIndex]}"`;
    
    seekBar.max = textChunks.length - 1;
    seekBar.value = currentChunkIndex;
    updateSliderFill(seekBar, seekFill);
    
    const pct = Math.round((currentChunkIndex / (textChunks.length - 1 || 1)) * 100);
    percentageDisplay.textContent = `${pct}%`;
}

// Core Playback Engine
function playChunk(index) {
    isManualNavigation = true; // Prevent previous onend events from firing falsely
    synth.cancel(); 
    
    setTimeout(() => {
        isManualNavigation = false;
        
        if (index < 0) index = 0;
        if (index >= textChunks.length) {
            stopPlayback();
            return;
        }
        
        currentChunkIndex = index;
        updateProgressUI();

        const utterance = new SpeechSynthesisUtterance(textChunks[index]);
        
        // Apply Settings
        utterance.volume = parseFloat(volumeSlider.value);
        utterance.rate = parseFloat(speedControl.value);
        
        const selectedVoice = voiceSelect.value;
        if (selectedVoice) {
            utterance.voice = voices.find(v => v.name === selectedVoice);
        }

        // Event Listeners
        utterance.onend = () => {
            if (isManualNavigation) return;
            if (currentChunkIndex < textChunks.length - 1) {
                playChunk(currentChunkIndex + 1);
            } else {
                stopPlayback();
            }
        };

        utterance.onerror = (e) => {
            if (e.error === 'interrupted' || e.error === 'canceled') return;
            console.error("Web Speech API Error:", e);
        };

        synth.speak(utterance);
        
        isPlaying = true;
        isPaused = false;
        
        playIconMain.classList.add('hidden'); 
        stopIconMain.classList.remove('hidden');
        playStatusText.textContent = "Pause";
    }, 50); // slight buffer allows synth.cancel() to fully clear memory
}

function stopPlayback() {
    isPlaying = false;
    isPaused = false;
    synth.cancel();
    
    playIconMain.classList.remove('hidden'); 
    stopIconMain.classList.add('hidden');
    playStatusText.textContent = "Play";
    
    currentChunkIndex = 0;
    updateProgressUI();
}

// Init App
initBtn.addEventListener('click', () => {
    const t = textInput.value.trim(); if (!t) return;
    
    originalText = t;
    textChunks = chunkText(t);
    currentChunkIndex = 0;
    
    playerUI.classList.remove('hidden'); 
    initBtn.classList.add('hidden');
    
    playChunk(0);
});

// Transport Controls
playBtnMain.addEventListener('click', () => {
    if (isPlaying) {
        if (isPaused) {
            synth.resume();
            isPaused = false;
            playIconMain.classList.add('hidden');
            stopIconMain.classList.remove('hidden');
            playStatusText.textContent = "Pause";
        } else {
            synth.pause();
            isPaused = true;
            playIconMain.classList.remove('hidden');
            stopIconMain.classList.add('hidden');
            playStatusText.textContent = "Resume";
        }
    } else {
        playChunk(currentChunkIndex);
    }
});

nextBtnWrapper.addEventListener('click', () => {
    if (currentChunkIndex < textChunks.length - 1) playChunk(currentChunkIndex + 1);
});

prevBtnWrapper.addEventListener('click', () => {
    if (currentChunkIndex > 0) playChunk(currentChunkIndex - 1);
});

// Seek Bar (Scrubbing via chunks)
seekBar.addEventListener('input', () => {
    updateSliderFill(seekBar, seekFill);
});

seekBar.addEventListener('change', () => { 
    const newIndex = parseInt(seekBar.value);
    playChunk(newIndex);
});

// Real-time Settings Adjustments
function applySettingsAndRestart() {
    if (isPlaying && !isPaused) {
        playChunk(currentChunkIndex); // Restarts current chunk with new speed/volume/voice
    }
}

volumeSlider.addEventListener('input', () => {
    updateSliderFill(volumeSlider, volumeFill);
    volumeLabel.textContent = Math.round(volumeSlider.value * 100) + '%';
});

volumeSlider.addEventListener('change', applySettingsAndRestart);
speedControl.addEventListener('change', applySettingsAndRestart);
voiceSelect.addEventListener('change', applySettingsAndRestart);

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    synth.cancel();
});

initBtn.disabled = true;