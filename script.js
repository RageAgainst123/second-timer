document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const preCountdownInput = document.getElementById('pre-countdown');
    const timerStateDisplay = document.getElementById('timer-state');
    const timerDisplay = document.getElementById('timer');
    const playPauseButton = document.getElementById('play-pause');
    const resetButton = document.getElementById('reset');
    const sound5SecondsCheckbox = document.getElementById('sound-5-seconds');
    const sound10SecondsCheckbox = document.getElementById('sound-10-seconds');
    const beepSound = document.getElementById('beep');
    const tickSound = document.getElementById('tick');
    
    // Adjust sound volumes
    beepSound.volume = 0.7;
    tickSound.volume = 0.5;
    
    // Create backup tick sound in case the main one fails
    const backupTickSound = new Audio('https://cdn.freesound.org/previews/522/522411_191718-lq.mp3');
    backupTickSound.volume = 0.5;
    
    // Timer variables
    let timerState = 'ready'; // ready, pre-countdown, running, paused
    let preCountdownValue = 0;
    let timerValue = 0;
    let timerInterval = null;
    let lastTickAt5 = -1;
    let lastTickAt10 = -1;
    
    // Initial setup
    updateTimerDisplay();
    
    // Preload sounds
    preloadSounds();
    
    // Event listeners
    playPauseButton.addEventListener('click', togglePlayPause);
    resetButton.addEventListener('click', resetTimer);
    
    // Prevent negative numbers in input
    preCountdownInput.addEventListener('change', () => {
        if (preCountdownInput.value < 1) {
            preCountdownInput.value = 1;
        } else if (preCountdownInput.value > 60) {
            preCountdownInput.value = 60;
        }
    });
    
    function preloadSounds() {
        // Try to preload the sounds
        try {
            beepSound.load();
            tickSound.load();
            backupTickSound.load();
            
            // Test play the sounds at volume 0 to ensure they're loaded and ready
            const testPlay = (audio) => {
                const originalVolume = audio.volume;
                audio.volume = 0;
                const promise = audio.play();
                if (promise !== undefined) {
                    promise.then(() => {
                        audio.pause();
                        audio.currentTime = 0;
                        audio.volume = originalVolume;
                    }).catch(e => console.log('Audio preload issue:', e));
                }
            };
            
            testPlay(beepSound);
            testPlay(tickSound);
            testPlay(backupTickSound);
        } catch (e) {
            console.log('Error preloading sounds:', e);
        }
    }
    
    function togglePlayPause() {
        if (timerState === 'ready' || timerState === 'paused') {
            startTimer();
        } else {
            pauseTimer();
        }
    }
    
    function startTimer() {
        if (timerState === 'ready') {
            // Start pre-countdown
            timerState = 'pre-countdown';
            preCountdownValue = parseInt(preCountdownInput.value);
            updateTimerDisplay();
            
            timerInterval = setInterval(updateTimer, 1000);
            
            playPauseButton.textContent = 'Pause';
        } else if (timerState === 'paused') {
            // Resume timer
            if (preCountdownValue > 0) {
                timerState = 'pre-countdown';
            } else {
                timerState = 'running';
            }
            
            timerInterval = setInterval(updateTimer, 1000);
            
            playPauseButton.textContent = 'Pause';
        }
    }
    
    function updateTimer() {
        if (timerState === 'pre-countdown') {
            preCountdownValue--;
            
            if (preCountdownValue <= 0) {
                // Pre-countdown finished, start main timer
                timerState = 'running';
                timerValue = 0;
                lastTickAt5 = -1;
                lastTickAt10 = -1;
                playBeepSound();
            }
        } else if (timerState === 'running') {
            timerValue++;
            
            // Check if we need to play sounds at specific intervals
            checkIntervalSounds();
        }
        
        updateTimerDisplay();
    }
    
    function playBeepSound() {
        try {
            // Reset and play the beep sound
            beepSound.currentTime = 0;
            const promise = beepSound.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.log('Error playing beep sound:', error);
                    // Try to create and play a new Audio object as fallback
                    const fallbackBeep = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                    fallbackBeep.volume = 0.7;
                    fallbackBeep.play().catch(e => console.log('Fallback beep failed too:', e));
                });
            }
        } catch (error) {
            console.log('Error playing beep sound:', error);
        }
    }
    
    function playTickSound() {
        try {
            // Reset and play the tick sound
            tickSound.currentTime = 0;
            const promise = tickSound.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.log('Error playing tick sound:', error);
                    // Try the backup tick sound
                    try {
                        backupTickSound.currentTime = 0;
                        backupTickSound.play().catch(e => console.log('Backup tick failed too:', e));
                    } catch (e) {
                        console.log('Error with backup tick:', e);
                    }
                });
            }
        } catch (error) {
            console.log('Error playing tick sound:', error);
            // Try the backup
            try {
                backupTickSound.currentTime = 0;
                backupTickSound.play().catch(e => {});
            } catch (e) {}
        }
    }
    
    function checkIntervalSounds() {
        // Prevent duplicate ticks when numbers align (like at 10 seconds which is both % 5 and % 10)
        if (sound5SecondsCheckbox.checked && timerValue % 5 === 0 && lastTickAt5 !== timerValue) {
            playTickSound();
            lastTickAt5 = timerValue;
        }
        
        if (sound10SecondsCheckbox.checked && timerValue % 10 === 0 && lastTickAt10 !== timerValue) {
            playTickSound();
            lastTickAt10 = timerValue;
        }
    }
    
    function pauseTimer() {
        timerState = 'paused';
        clearInterval(timerInterval);
        playPauseButton.textContent = 'Play';
        updateTimerDisplay();
    }
    
    function resetTimer() {
        timerState = 'ready';
        preCountdownValue = 0;
        timerValue = 0;
        lastTickAt5 = -1;
        lastTickAt10 = -1;
        clearInterval(timerInterval);
        playPauseButton.textContent = 'Play';
        updateTimerDisplay();
    }
    
    function updateTimerDisplay() {
        // Update timer state text
        switch (timerState) {
            case 'ready':
                timerStateDisplay.textContent = 'Ready';
                timerDisplay.textContent = '0';
                break;
            case 'pre-countdown':
                timerStateDisplay.textContent = 'Starting in';
                timerDisplay.textContent = preCountdownValue;
                break;
            case 'running':
                timerStateDisplay.textContent = 'Timer';
                timerDisplay.textContent = formatTime(timerValue);
                break;
            case 'paused':
                if (preCountdownValue > 0) {
                    timerStateDisplay.textContent = 'Paused (Starting in)';
                    timerDisplay.textContent = preCountdownValue;
                } else {
                    timerStateDisplay.textContent = 'Paused';
                    timerDisplay.textContent = formatTime(timerValue);
                }
                break;
        }
    }
    
    function formatTime(seconds) {
        return seconds.toString();
    }
    
    // Add keyboard support for spacebar to play/pause
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            togglePlayPause();
        } else if (event.code === 'KeyR') {
            resetTimer();
        }
    });
}); 