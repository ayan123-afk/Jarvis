// ===== J.A.R.V.I.S. CORE SYSTEM =====

const API_URL = 'https://ma-api-system.vercel.app/api/ai';

// DOM Elements
const responseText = document.getElementById('responseText');
const commandInput = document.getElementById('commandInput');
const sendBtn = document.getElementById('sendBtn');
const voiceBtn = document.getElementById('voiceBtn');
const listeningIndicator = document.getElementById('listeningIndicator');
const responseTimeEl = document.getElementById('responseTime');
const commandCountEl = document.getElementById('commandCount');
const timeEl = document.getElementById('time');

// State
let commandCount = 0;
let isListening = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    updateClock();
    setInterval(updateClock, 1000);
    
    // Focus input
    commandInput.focus();
});

// ===== CREATE BACKGROUND PARTICLES =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== UPDATE CLOCK =====
function updateClock() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
}

// ===== SEND COMMAND =====
async function sendCommand(prompt) {
    if (!prompt || prompt.trim() === '') return;
    
    // Update UI
    responseText.innerHTML = `<span style="opacity:0.7;">Processing: "${prompt}"</span>`;
    commandInput.value = '';
    
    const startTime = performance.now();
    
    try {
        // Call your API
        const response = await fetch(`${API_URL}?prompt=${encodeURIComponent(prompt)}`);
        
        if (!response.ok) {
            throw new Error('API communication error');
        }
        
        const data = await response.json();
        
        // Calculate response time
        const endTime = performance.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);
        
        // Extract AI response (adjust based on your API response format)
        const aiResponse = data.response || data.text || data.message || data.reply || JSON.stringify(data);
        
        // Update display
        responseText.innerHTML = aiResponse;
        responseTimeEl.textContent = responseTime + 's';
        
        // Update command count
        commandCount++;
        commandCountEl.textContent = commandCount;
        
        // Speak response
        speakText(aiResponse);
        
    } catch (error) {
        console.error('JARVIS Error:', error);
        responseText.innerHTML = '<span style="color:#ff4444;">⚠ System error. Please try again, sir.</span>';
        responseTimeEl.textContent = 'ERR';
    }
}

// ===== SPEECH RECOGNITION =====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US'; // Change to 'hi-IN' for Hindi
    recognition.interimResults = false;
    
    recognition.onstart = () => {
        isListening = true;
        listeningIndicator.classList.add('active');
        voiceBtn.style.background = 'rgba(0, 240, 255, 0.3)';
        voiceBtn.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.6)';
        responseText.innerHTML = '<span style="opacity:0.7;">🎤 Listening...</span>';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        commandInput.value = transcript;
        sendCommand(transcript);
    };
    
    recognition.onend = () => {
        isListening = false;
        listeningIndicator.classList.remove('active');
        voiceBtn.style.background = 'rgba(0, 30, 60, 0.8)';
        voiceBtn.style.boxShadow = 'none';
    };
    
    recognition.onerror = (event) => {
        isListening = false;
        listeningIndicator.classList.remove('active');
        voiceBtn.style.background = 'rgba(0, 30, 60, 0.8)';
        voiceBtn.style.boxShadow = 'none';
        responseText.innerHTML = '<span style="color:#ffaa00;">⚠ I didn\'t catch that. Please try again.</span>';
        console.error('Recognition error:', event.error);
    };
} else {
    voiceBtn.style.display = 'none';
    console.warn('Speech Recognition not supported');
}

// ===== TEXT TO SPEECH =====
function speakText(text) {
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.85;  // Slower for Jarvis feel
        utterance.pitch = 0.7;  // Deeper voice
        utterance.volume = 0.8;
        
        // Try to get a deep male voice
        const voices = window.speechSynthesis.getVoices();
        const deepVoice = voices.find(voice => 
            voice.name.includes('Male') || 
            voice.name.includes('Daniel') || 
            voice.name.includes('Google UK English Male')
        );
        
        if (deepVoice) {
            utterance.voice = deepVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    }
}

// ===== EVENT LISTENERS =====

// Send button click
sendBtn.addEventListener('click', () => {
    const prompt = commandInput.value.trim();
    if (prompt) {
        sendCommand(prompt);
    }
});

// Enter key press
commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const prompt = commandInput.value.trim();
        if (prompt) {
            sendCommand(prompt);
        }
    }
});

// Voice button click
voiceBtn.addEventListener('click', () => {
    if (recognition) {
        if (!isListening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    }
});

// Keep input focused
document.addEventListener('click', () => {
    if (!isListening) {
        commandInput.focus();
    }
});

// ===== WELCOME MESSAGE =====
console.log(`
╔══════════════════════════════════════╗
║   J.A.R.V.I.S. - Online & Ready    ║
║   Just A Rather Very Intelligent   ║
║   System                           ║
╚══════════════════════════════════════╝
`);
