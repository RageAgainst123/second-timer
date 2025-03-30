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
            
            timerInterval = setInterval(() => {
                if (timerState === 'pre-countdown') {
                    preCountdownValue--;
                    
                    if (preCountdownValue <= 0) {
                        // Pre-countdown finished, start main timer
                        timerState = 'running';
                        timerValue = 0;
                        beepSound.play(); // Play sound when main timer starts
                    }
                } else if (timerState === 'running') {
                    timerValue++;
                    
                    // Check if we need to play sounds at specific intervals
                    if (sound5SecondsCheckbox.checked && timerValue % 5 === 0) {
                        tickSound.play();
                    } else if (sound10SecondsCheckbox.checked && timerValue % 10 === 0) {
                        tickSound.play();
                    }
                }
                
                updateTimerDisplay();
            }, 1000);
            
            playPauseButton.textContent = 'Pause';
        } else if (timerState === 'paused') {
            // Resume timer
            if (preCountdownValue > 0) {
                timerState = 'pre-countdown';
            } else {
                timerState = 'running';
            }
            
            timerInterval = setInterval(() => {
                if (timerState === 'pre-countdown') {
                    preCountdownValue--;
                    
                    if (preCountdownValue <= 0) {
                        // Pre-countdown finished, start main timer
                        timerState = 'running';
                        timerValue = 0;
                        beepSound.play(); // Play sound when main timer starts
                    }
                } else if (timerState === 'running') {
                    timerValue++;
                    
                    // Check if we need to play sounds at specific intervals
                    if (sound5SecondsCheckbox.checked && timerValue % 5 === 0) {
                        tickSound.play();
                    } else if (sound10SecondsCheckbox.checked && timerValue % 10 === 0) {
                        tickSound.play();
                    }
                }
                
                updateTimerDisplay();
            }, 1000);
            
            playPauseButton.textContent = 'Pause';
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
        // For now, just return the seconds as is, but this function can be expanded
        // to format time as minutes:seconds if needed in the future
        return seconds.toString();
    }
}); 