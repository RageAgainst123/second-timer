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
    beepSound.volume = 0.6;
    tickSound.volume = 0.3;
    
    // Preload sounds
    beepSound.load();
    tickSound.load();
    
    // Timer variables
    let timerState = 'ready'; // ready, pre-countdown, running, paused
    let preCountdownValue = 0;
    let timerValue = 0;
    let timerInterval = null;
    
    // Initial setup
    updateTimerDisplay();
    
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
                playSound(beepSound);
            }
        } else if (timerState === 'running') {
            timerValue++;
            
            // Check if we need to play sounds at specific intervals
            checkSounds();
        }
        
        updateTimerDisplay();
    }
    
    function playSound(soundElement) {
        try {
            // Reset audio to beginning and play
            soundElement.currentTime = 0;
            const playPromise = soundElement.play();
            
            // Handle the promise to prevent uncaught errors
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing sound:', error);
                });
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
    
    function checkSounds() {
        // Check if we're exactly at a multiple of 5 or 10 seconds
        const playSound5Seconds = sound5SecondsCheckbox.checked && timerValue % 5 === 0;
        const playSound10Seconds = sound10SecondsCheckbox.checked && timerValue % 10 === 0;
        
        if (playSound5Seconds || playSound10Seconds) {
            console.log(`Playing tick sound at ${timerValue} seconds`);
            playSound(tickSound);
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