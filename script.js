document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const timerStateDisplay = document.getElementById('timer-state');
    const timerDisplay = document.getElementById('timer');
    const playPauseButton = document.getElementById('play-pause');
    const resetButton = document.getElementById('reset');
    
    // Settings elements
    const preCountdownInput = document.getElementById('pre-countdown');
    const sound5SecondsCheckbox = document.getElementById('sound-5-seconds');
    const sound10SecondsCheckbox = document.getElementById('sound-10-seconds');
    
    // Settings modal elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveSettingsBtn = document.getElementById('save-settings');
    
    // Sound settings elements
    const mainSoundSelect = document.getElementById('main-sound-select');
    const mainSoundVolume = document.getElementById('main-sound-volume');
    const mainVolumeValue = document.getElementById('main-volume-value');
    const testMainSoundBtn = document.getElementById('test-main-sound');
    
    const intervalSoundSelect = document.getElementById('interval-sound-select');
    const intervalSoundVolume = document.getElementById('interval-sound-volume');
    const intervalVolumeValue = document.getElementById('interval-volume-value');
    const testIntervalSoundBtn = document.getElementById('test-interval-sound');
    
    const soundCustomIntervalCheckbox = document.getElementById('sound-custom-interval');
    const customIntervalInput = document.getElementById('custom-interval');
    
    const enableMainSoundCheckbox = document.getElementById('enable-main-sound');
    const enableIntervalSoundsCheckbox = document.getElementById('enable-interval-sounds');
    
    // Sound objects
    let mainSound = null;
    let intervalSound = null;
    
    // Settings defaults
    let soundSettings = {
        preCountdownTime: 5,
        sound5Seconds: false,
        sound10Seconds: false,
        mainSoundType: 'beep',
        mainSoundVolume: 0.8,
        intervalSoundType: 'tick',
        intervalSoundVolume: 0.6,
        customInterval: 15,
        customIntervalEnabled: false,
        mainSoundEnabled: true,
        intervalSoundsEnabled: true
    };
    
    // Timer variables
    let timerState = 'ready'; // ready, pre-countdown, running, paused
    let preCountdownValue = 0;
    let timerValue = 0;
    let timerInterval = null;
    let lastTickAt5 = -1;
    let lastTickAt10 = -1;
    let lastTickAtCustom = -1;
    
    // Load saved settings if available
    loadSettings();
    
    // Initialize sounds
    initSounds();
    
    // Initial setup
    updateTimerDisplay();
    
    // Event listeners for timer controls
    playPauseButton.addEventListener('click', togglePlayPause);
    resetButton.addEventListener('click', resetTimer);
    
    // Event listeners for settings modal
    settingsBtn.addEventListener('click', openSettingsModal);
    closeModalBtn.addEventListener('click', closeSettingsModal);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Event listeners for sound settings
    mainSoundVolume.addEventListener('input', updateMainVolumeDisplay);
    intervalSoundVolume.addEventListener('input', updateIntervalVolumeDisplay);
    testMainSoundBtn.addEventListener('click', testMainSound);
    testIntervalSoundBtn.addEventListener('click', testIntervalSound);
    
    // Update initial volume displays
    updateMainVolumeDisplay();
    updateIntervalVolumeDisplay();
    
    // Prevent negative numbers in input fields
    preCountdownInput.addEventListener('change', () => {
        if (preCountdownInput.value < 1) {
            preCountdownInput.value = 1;
        } else if (preCountdownInput.value > 60) {
            preCountdownInput.value = 60;
        }
    });
    
    customIntervalInput.addEventListener('change', () => {
        if (customIntervalInput.value < 1) {
            customIntervalInput.value = 1;
        } else if (customIntervalInput.value > 60) {
            customIntervalInput.value = 60;
        }
    });
    
    function loadSettings() {
        // Check if we have stored settings
        const savedSettings = localStorage.getItem('secondTimerSettings');
        if (savedSettings) {
            try {
                const parsedSettings = JSON.parse(savedSettings);
                soundSettings = { ...soundSettings, ...parsedSettings };
                
                // Apply loaded settings to UI
                preCountdownInput.value = soundSettings.preCountdownTime;
                sound5SecondsCheckbox.checked = soundSettings.sound5Seconds;
                sound10SecondsCheckbox.checked = soundSettings.sound10Seconds;
                
                mainSoundSelect.value = soundSettings.mainSoundType;
                mainSoundVolume.value = soundSettings.mainSoundVolume;
                intervalSoundSelect.value = soundSettings.intervalSoundType;
                intervalSoundVolume.value = soundSettings.intervalSoundVolume;
                soundCustomIntervalCheckbox.checked = soundSettings.customIntervalEnabled;
                customIntervalInput.value = soundSettings.customInterval;
                enableMainSoundCheckbox.checked = soundSettings.mainSoundEnabled;
                enableIntervalSoundsCheckbox.checked = soundSettings.intervalSoundsEnabled;
            } catch (err) {
                console.log('Error loading settings:', err);
            }
        }
    }
    
    function saveSettings() {
        // Update settings object with current UI values
        soundSettings.preCountdownTime = parseInt(preCountdownInput.value);
        soundSettings.sound5Seconds = sound5SecondsCheckbox.checked;
        soundSettings.sound10Seconds = sound10SecondsCheckbox.checked;
        
        soundSettings.mainSoundType = mainSoundSelect.value;
        soundSettings.mainSoundVolume = parseFloat(mainSoundVolume.value);
        soundSettings.intervalSoundType = intervalSoundSelect.value;
        soundSettings.intervalSoundVolume = parseFloat(intervalSoundVolume.value);
        soundSettings.customInterval = parseInt(customIntervalInput.value);
        soundSettings.customIntervalEnabled = soundCustomIntervalCheckbox.checked;
        soundSettings.mainSoundEnabled = enableMainSoundCheckbox.checked;
        soundSettings.intervalSoundsEnabled = enableIntervalSoundsCheckbox.checked;
        
        // Save to localStorage
        localStorage.setItem('secondTimerSettings', JSON.stringify(soundSettings));
        
        // Re-initialize sounds with new settings
        initSounds();
        
        // Close modal
        closeSettingsModal();
    }
    
    function updateMainVolumeDisplay() {
        const volumePercentage = Math.round(mainSoundVolume.value * 100);
        mainVolumeValue.textContent = volumePercentage + '%';
    }
    
    function updateIntervalVolumeDisplay() {
        const volumePercentage = Math.round(intervalSoundVolume.value * 100);
        intervalVolumeValue.textContent = volumePercentage + '%';
    }
    
    function openSettingsModal() {
        settingsModal.classList.add('show');
    }
    
    function closeSettingsModal() {
        settingsModal.classList.remove('show');
    }
    
    function testMainSound() {
        const soundToTest = document.getElementById(mainSoundSelect.value);
        const testVolume = parseFloat(mainSoundVolume.value);
        
        if (soundToTest) {
            const testSoundInstance = new Audio(soundToTest.src);
            testSoundInstance.volume = testVolume;
            testSoundInstance.play().catch(err => {
                console.log('Error playing test sound:', err);
            });
        }
    }
    
    function testIntervalSound() {
        const soundToTest = document.getElementById(intervalSoundSelect.value);
        const testVolume = parseFloat(intervalSoundVolume.value);
        
        if (soundToTest) {
            const testSoundInstance = new Audio(soundToTest.src);
            testSoundInstance.volume = testVolume;
            testSoundInstance.play().catch(err => {
                console.log('Error playing test sound:', err);
            });
        }
    }
    
    function initSounds() {
        // Create new Audio objects for main sound
        const mainSoundElement = document.getElementById(soundSettings.mainSoundType);
        if (mainSoundElement) {
            mainSound = {
                src: mainSoundElement.src,
                volume: soundSettings.mainSoundVolume
            };
        } else {
            // Fallback to beep
            const beepElement = document.getElementById('beep');
            mainSound = {
                src: beepElement.src,
                volume: soundSettings.mainSoundVolume
            };
        }
        
        // Create new Audio objects for interval sound
        const intervalSoundElement = document.getElementById(soundSettings.intervalSoundType);
        if (intervalSoundElement) {
            intervalSound = {
                src: intervalSoundElement.src,
                volume: soundSettings.intervalSoundVolume
            };
        } else {
            // Fallback to tick
            const tickElement = document.getElementById('tick');
            intervalSound = {
                src: tickElement.src,
                volume: soundSettings.intervalSoundVolume
            };
        }
        
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
            preCountdownValue = soundSettings.preCountdownTime;
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
                lastTickAtCustom = -1;
                
                // Play main start sound if enabled
                if (soundSettings.mainSoundEnabled) {
                    playSound(mainSound, true); // Play main sound with higher priority
                }
            }
        } else if (timerState === 'running') {
            timerValue++;
            
            // Check if we need to play sounds at specific intervals
            if (soundSettings.intervalSoundsEnabled) {
                checkIntervalSounds();
            }
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
        // Sound at 5 second intervals if enabled
        if (soundSettings.sound5Seconds && timerValue % 5 === 0 && lastTickAt5 !== timerValue) {
            playSound(intervalSound);
            lastTickAt5 = timerValue;
        }
        
        // Sound at 10 second intervals if enabled
        if (soundSettings.sound10Seconds && timerValue % 10 === 0 && lastTickAt10 !== timerValue) {
            playSound(intervalSound);
            lastTickAt10 = timerValue;
        }
        
        // Sound at custom interval if enabled
        if (soundSettings.customIntervalEnabled && 
            timerValue % soundSettings.customInterval === 0 && 
            timerValue > 0 && 
            lastTickAtCustom !== timerValue) {
            playSound(intervalSound);
            lastTickAtCustom = timerValue;
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
        lastTickAtCustom = -1;
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
        } else if (event.code === 'KeyS') {
            // S key to open settings
            openSettingsModal();
        }
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            closeSettingsModal();
        }
    });
}); 