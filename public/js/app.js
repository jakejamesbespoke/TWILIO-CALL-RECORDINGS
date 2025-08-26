class RecordingsApp {
    constructor() {
        this.socket = null;
        this.recordings = [];
        this.audioElements = new Map();
        this.init();
    }

    init() {
        this.connectSocket();
        this.setupEventListeners();
        this.loadRecordings();
    }

    connectSocket() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
        
        this.socket = io({
            auth: {
                token: token
            }
        });
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
            this.updateConnectionStatus(false);
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
            if (error.message === 'Authentication error') {
                localStorage.removeItem('token');
                window.location.href = '/login.html';
            }
        });

        this.socket.on('newRecording', (recordingData) => {
            console.log('New recording received:', recordingData);
            this.handleNewRecording(recordingData);
        });
    }

    updateConnectionStatus(connected) {
        const indicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (connected) {
            indicator.classList.add('connected');
            statusText.textContent = 'Connected';
        } else {
            indicator.classList.remove('connected');
            statusText.textContent = 'Disconnected';
        }
    }

    setupEventListeners() {
        const refreshBtn = document.getElementById('refreshBtn');
        refreshBtn.addEventListener('click', () => this.loadRecordings());
        
        // Add logout functionality
        const logoutBtn = document.createElement('button');
        logoutBtn.textContent = 'Logout';
        logoutBtn.className = 'btn btn-secondary';
        logoutBtn.style.marginLeft = '10px';
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        });
        refreshBtn.parentElement.appendChild(logoutBtn);
    }

    async loadRecordings() {
        const loadingSpinner = document.getElementById('loadingSpinner');
        const recordingsList = document.getElementById('recordingsList');
        
        loadingSpinner.style.display = 'block';
        recordingsList.innerHTML = '';

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/webhooks/recordings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error('Failed to fetch recordings');
            }
            
            this.recordings = await response.json();
            this.renderRecordings();
        } catch (error) {
            console.error('Error loading recordings:', error);
            recordingsList.innerHTML = `
                <div class="empty-state">
                    <h3>⚠️ Error loading recordings</h3>
                    <p>${error.message}</p>
                </div>
            `;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    renderRecordings() {
        const recordingsList = document.getElementById('recordingsList');
        
        if (this.recordings.length === 0) {
            recordingsList.innerHTML = `
                <div class="empty-state">
                    <h3>📭 No recordings found</h3>
                    <p>Recordings will appear here when calls are completed.</p>
                </div>
            `;
            return;
        }

        const recordingsHTML = this.recordings.map(recording => 
            this.createRecordingElement(recording)
        ).join('');

        recordingsList.innerHTML = recordingsHTML;
        this.attachRecordingEventListeners();
    }

    createRecordingElement(recording) {
        const date = new Date(recording.dateCreated).toLocaleString();
        const duration = this.formatDuration(recording.duration);
        
        return `
            <div class="recording-item" data-sid="${recording.sid}">
                <div class="recording-header">
                    <div class="recording-info">
                        <div class="recording-title">
                            📞 Call Recording
                        </div>
                        <div class="recording-details">
                            <strong>Date:</strong> ${date}<br>
                            <strong>Call SID:</strong> ${recording.callSid}<br>
                            <strong>Status:</strong> ${recording.status}
                        </div>
                    </div>
                    <div class="recording-controls">
                        <span class="duration">${duration}</span>
                        <button class="play-btn" data-sid="${recording.sid}" title="Play recording">
                            ▶️
                        </button>
                    </div>
                </div>
                <div class="audio-container" id="audio-${recording.sid}" style="display: none;"></div>
            </div>
        `;
    }

    attachRecordingEventListeners() {
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const sid = e.target.dataset.sid;
                this.toggleRecording(sid, button);
            });
        });
    }

    async toggleRecording(sid, button) {
        const audioContainer = document.getElementById(`audio-${sid}`);
        
        if (this.audioElements.has(sid)) {
            const audio = this.audioElements.get(sid);
            if (audio.paused) {
                audio.play();
                button.textContent = '⏸️';
                button.classList.add('playing');
            } else {
                audio.pause();
                button.textContent = '▶️';
                button.classList.remove('playing');
            }
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/webhooks/recording/${sid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem('token');
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error('Failed to fetch recording URL');
            }
            
            const { url } = await response.json();
            
            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = url;
            
            audio.addEventListener('ended', () => {
                button.textContent = '▶️';
                button.classList.remove('playing');
            });

            audio.addEventListener('pause', () => {
                button.textContent = '▶️';
                button.classList.remove('playing');
            });

            audio.addEventListener('play', () => {
                button.textContent = '⏸️';
                button.classList.add('playing');
            });

            audioContainer.appendChild(audio);
            audioContainer.style.display = 'block';
            
            this.audioElements.set(sid, audio);
            
            audio.play();
            button.textContent = '⏸️';
            button.classList.add('playing');

        } catch (error) {
            console.error('Error playing recording:', error);
            alert('Failed to play recording: ' + error.message);
        }
    }

    handleNewRecording(recordingData) {
        this.showNotification(recordingData);
        
        document.getElementById('notificationsSection').style.display = 'block';
        
        setTimeout(() => {
            this.loadRecordings();
        }, 1000);
    }

    showNotification(recordingData) {
        const notificationsDiv = document.getElementById('notifications');
        
        const notification = document.createElement('div');
        notification.className = 'notification new';
        notification.innerHTML = `
            <strong>🎵 New Recording Available!</strong><br>
            <small>
                From: ${recordingData.from || 'Unknown'}<br>
                To: ${recordingData.to || 'Unknown'}<br>
                Duration: ${this.formatDuration(recordingData.duration)}<br>
                Time: ${new Date(recordingData.timestamp).toLocaleString()}
            </small>
        `;

        notificationsDiv.insertBefore(notification, notificationsDiv.firstChild);

        setTimeout(() => {
            notification.classList.remove('new');
        }, 3000);

        if (notificationsDiv.children.length > 5) {
            notificationsDiv.removeChild(notificationsDiv.lastChild);
        }
    }

    formatDuration(seconds) {
        if (!seconds || seconds === '0') return '0s';
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        if (mins > 0) {
            return `${mins}m ${secs}s`;
        }
        return `${secs}s`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RecordingsApp();
});