document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const preCountdownInput = document.getElementById('pre-countdown');
    const timerStateDisplay = document.getElementById('timer-state');
    const timerDisplay = document.getElementById('timer');
    const playPauseButton = document.getElementById('play-pause');
    const resetButton = document.getElementById('reset');
    const sound5SecondsCheckbox = document.getElementById('sound-5-seconds');
    const sound10SecondsCheckbox = document.getElementById('sound-10-seconds');
    
    // Better approach for audio - create new Audio objects instead of using DOM elements
    let beepSound = null;
    let tickSound = null;
    
    // Timer variables
    let timerState = 'ready'; // ready, pre-countdown, running, paused
    let preCountdownValue = 0;
    let timerValue = 0;
    let timerInterval = null;
    let lastTickAt5 = -1;
    let lastTickAt10 = -1;
    
    // Initialize sounds
    initSounds();
    
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
    
    function initSounds() {
        // Create new Audio objects instead of relying on the DOM elements
        beepSound = new Audio('https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3');
        tickSound = new Audio('https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample2.mp3');
        
        // Set volume
        beepSound.volume = 0.8;
        tickSound.volume = 0.6;
        
        // Enable sounds on mobile by adding a touch event to the body
        document.body.addEventListener('touchstart', function() {
            // Create and play a silent sound to enable audio on mobile
            const silentSound = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADQADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UGQAAANUAUi0AAAIwwApFoAAAQBkBSLQAAAgAAC/2gAICAg8vLy8vLy8vLz8/Pz8/Pz8/Ly8vLy8vLy8vP//////////////////////////////////////////////////////////////////9PT09PT09PT09PT////////////////////////////////////////////////////////////////x8fHx8fHx8fHx8f/////////////////////////////////////////////////////////////7UGUAVAA+wBC7AAACAAAJYAAAAQAAAEuAAAAIAAAJcAAAAT//////////////////////////////////////////////////////////////////5ubm5ubm5ubm5v/////////////////////////////////////////////////////////////i4uLi4uLi4uLi4v/////////////////////////////////////////////////////////////7UGUAggA5gEtMAAAIAAAJYAAAAQAAASwAAAAgAAAlgAAABP/////////////////////////////////////////////////////////////w8PDw8PDw8PDw8P////////////////////////////////////////////////////////////Dw8PDw8PDw8PDw8P/////////////////////////////////////////////////////////////7UGUBJwAzAEtAAAAIAAAJYAAAAQAAASwAAAAgAAAlgAAABP////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7UGUAVAAyAErAAAAIAAAJYAAAAQAAASwAAAAgAAAlgAAABP////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7UGUAggA1AEqsAAAIAAAJYAAAAQAAASwAAAAgAAAlgAAABP////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7UGUAggA1gEqMAAAIAAAJYAAAAQAAASwAAAAgAAAlgAAABP////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////7UGUAgAApAUAAAAACAAAJYAAAAQAAASwAAAAgAAAlgAAABP/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////AAA=");
            silentSound.play().catch(e => {});
        }, {once: true});
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
            
            // Update button icon and text
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
        } else if (timerState === 'paused') {
            // Resume timer
            if (preCountdownValue > 0) {
                timerState = 'pre-countdown';
            } else {
                timerState = 'running';
            }
            
            timerInterval = setInterval(updateTimer, 1000);
            
            // Update button icon and text
            playPauseButton.innerHTML = '<i class="fas fa-pause"></i> Pause';
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
                playSound(beepSound, true); // Play beep with higher priority
            }
        } else if (timerState === 'running') {
            timerValue++;
            
            // Check if we need to play sounds at specific intervals
            checkIntervalSounds();
        }
        
        updateTimerDisplay();
    }
    
    function playSound(sound, important = false) {
        try {
            // Create a new instance to allow overlapping sounds
            const soundToPlay = new Audio(sound.src);
            soundToPlay.volume = sound.volume;
            
            // For important sounds like the beep, try multiple approaches
            if (important) {
                // Try the normal way first
                soundToPlay.play().catch(err => {
                    console.log('Error playing sound:', err);
                    
                    // If that fails, try with user interaction simulation
                    document.body.addEventListener('click', function playOnClick() {
                        soundToPlay.play().catch(e => console.log('Still failed:', e));
                        document.body.removeEventListener('click', playOnClick);
                    }, { once: true });
                    
                    // Prompt the user to interact
                    timerStateDisplay.textContent = "TAP SCREEN FOR SOUND";
                    setTimeout(() => {
                        if (timerState === 'running') {
                            timerStateDisplay.textContent = "TIMER";
                        }
                    }, 2000);
                });
            } else {
                // For less important sounds, just try once
                soundToPlay.play().catch(err => {
                    console.log('Error playing interval sound:', err);
                });
            }
        } catch (err) {
            console.log('Error creating sound:', err);
        }
    }
    
    function checkIntervalSounds() {
        // Sound at 5 second intervals
        if (sound5SecondsCheckbox.checked && timerValue % 5 === 0 && lastTickAt5 !== timerValue) {
            playSound(tickSound);
            lastTickAt5 = timerValue;
        }
        
        // Sound at 10 second intervals
        if (sound10SecondsCheckbox.checked && timerValue % 10 === 0 && lastTickAt10 !== timerValue) {
            playSound(tickSound);
            lastTickAt10 = timerValue;
        }
    }
    
    function pauseTimer() {
        timerState = 'paused';
        clearInterval(timerInterval);
        
        // Update button icon and text
        playPauseButton.innerHTML = '<i class="fas fa-play"></i> Play';
        
        updateTimerDisplay();
    }
    
    function resetTimer() {
        timerState = 'ready';
        preCountdownValue = 0;
        timerValue = 0;
        lastTickAt5 = -1;
        lastTickAt10 = -1;
        clearInterval(timerInterval);
        
        // Update button icon and text
        playPauseButton.innerHTML = '<i class="fas fa-play"></i> Play';
        
        updateTimerDisplay();
    }
    
    function updateTimerDisplay() {
        // Update timer state text
        switch (timerState) {
            case 'ready':
                timerStateDisplay.textContent = 'READY';
                timerDisplay.textContent = '0';
                break;
            case 'pre-countdown':
                timerStateDisplay.textContent = 'STARTING IN';
                timerDisplay.textContent = preCountdownValue;
                break;
            case 'running':
                timerStateDisplay.textContent = 'TIMER';
                timerDisplay.textContent = formatTime(timerValue);
                break;
            case 'paused':
                if (preCountdownValue > 0) {
                    timerStateDisplay.textContent = 'PAUSED (STARTING IN)';
                    timerDisplay.textContent = preCountdownValue;
                } else {
                    timerStateDisplay.textContent = 'PAUSED';
                    timerDisplay.textContent = formatTime(timerValue);
                }
                break;
        }
    }
    
    function formatTime(seconds) {
        return seconds.toString();
    }
    
    // Add keyboard support for spacebar to play/pause and r key to reset
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            event.preventDefault();
            togglePlayPause();
        } else if (event.code === 'KeyR') {
            resetTimer();
        }
    });
}); 