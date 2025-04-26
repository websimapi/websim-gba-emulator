import { GamepadControls } from './controls.js';
import StorageManager from './storage.js';
import { readFileAsArrayBuffer, downloadFile } from './utils.js';

class GBAEmulator {
    constructor() {
        // Use the globally available GameBoyAdvance constructor
        // instead of trying to import it as a module
        this.gba = new window.GameBoyAdvance();
        this.controls = new GamepadControls(this);
        this.canvas = document.getElementById('screen');
        this.fpsCounter = document.getElementById('fps-counter');
        this.biosLoaded = false;
        this.romLoaded = false;
        this.romCode = null;
        this.paused = false;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFrame = performance.now();
        
        // Initialize emulator
        this.gba.logLevel = this.gba.LOG_ERROR;
        this.gba.setCanvas(this.canvas);
        
        // Set up file inputs
        this._setupFileInputs();
        
        // Set up emulator controls
        this._setupEmulatorControls();
        
        // Calculate FPS
        setInterval(() => this._updateFPS(), 1000);
        
        // Frame counter for FPS calculation
        const runFrame = () => {
            if (this.romLoaded && !this.paused) {
                this.frameCount++;
            }
            requestAnimationFrame(runFrame);
        };
        requestAnimationFrame(runFrame);
    }

    _setupFileInputs() {
        // BIOS loader
        const biosFileInput = document.getElementById('bios-file');
        biosFileInput.addEventListener('change', async (event) => {
            if (event.target.files.length === 0) return;
            
            try {
                const biosFile = event.target.files[0];
                const biosBuffer = await readFileAsArrayBuffer(biosFile);
                this.gba.setBios(biosBuffer);
                this.biosLoaded = true;
                StorageManager.saveData('bios', 'default', biosBuffer);
                console.log('BIOS loaded successfully');
                
                // Try to autostart if ROM is also loaded
                this._tryAutostart();
            } catch (error) {
                console.error('Failed to load BIOS:', error);
            }
        });
        
        // ROM loader
        const romFileInput = document.getElementById('rom-file');
        romFileInput.addEventListener('change', async (event) => {
            if (event.target.files.length === 0) return;
            
            try {
                const romFile = event.target.files[0];
                const romBuffer = await readFileAsArrayBuffer(romFile);
                
                // Get ROM code for save data
                this.romCode = romFile.name.replace(/\.[^/.]+$/, "");
                
                if (this.gba.setRom(romBuffer)) {
                    this.romLoaded = true;
                    console.log('ROM loaded successfully:', this.romCode);
                    
                    // Try to autostart
                    this._tryAutostart();
                } else {
                    console.error('Invalid ROM file');
                }
            } catch (error) {
                console.error('Failed to load ROM:', error);
            }
        });
        
        // Save file loader
        const saveFileInput = document.getElementById('save-file');
        saveFileInput.addEventListener('change', async (event) => {
            if (event.target.files.length === 0 || !this.romLoaded) return;
            
            try {
                const saveFile = event.target.files[0];
                const saveBuffer = await readFileAsArrayBuffer(saveFile);
                this.gba.setSavedata(saveBuffer);
                console.log('Save data loaded successfully');
            } catch (error) {
                console.error('Failed to load save data:', error);
            }
        });
        
        // Try to load saved BIOS
        const savedBios = StorageManager.loadData('bios', 'default', true);
        if (savedBios) {
            try {
                this.gba.setBios(savedBios);
                this.biosLoaded = true;
                console.log('Loaded BIOS from local storage');
            } catch (error) {
                console.error('Failed to load BIOS from storage:', error);
            }
        }
    }

    _setupEmulatorControls() {
        // Play/Pause button
        const playPauseButton = document.getElementById('play-pause');
        playPauseButton.addEventListener('click', () => {
            if (this.paused) {
                this.resume();
                playPauseButton.textContent = 'Pause';
            } else {
                this.pause();
                playPauseButton.textContent = 'Resume';
            }
        });
        
        // Reset button
        const resetButton = document.getElementById('reset');
        resetButton.addEventListener('click', () => {
            if (!this.romLoaded) return;
            this.gba.reset();
            if (this.paused) {
                this.resume();
                playPauseButton.textContent = 'Pause';
            }
        });
        
        // Save state button
        const saveStateButton = document.getElementById('save-state');
        saveStateButton.addEventListener('click', () => {
            if (!this.romLoaded) return;
            const state = this.gba.freeze();
            StorageManager.saveData('savestate', this.romCode, state);
            console.log('State saved');
        });
        
        // Load state button
        const loadStateButton = document.getElementById('load-state');
        loadStateButton.addEventListener('click', () => {
            if (!this.romLoaded) return;
            const state = StorageManager.loadData('savestate', this.romCode);
            if (state) {
                this.gba.defrost(state);
                console.log('State loaded');
            } else {
                console.log('No saved state found');
            }
        });
        
        // Download save button
        const downloadSaveButton = document.getElementById('download-save');
        downloadSaveButton.addEventListener('click', () => {
            if (!this.romLoaded || !this.gba.mmu.save) {
                console.log('No save data available');
                return;
            }
            
            const saveData = new Uint8Array(this.gba.mmu.save.buffer);
            downloadFile(saveData, `${this.romCode || 'game'}.sav`, 'application/octet-stream');
        });
    }

    _tryAutostart() {
        if (this.biosLoaded && this.romLoaded && !this.gba.paused) {
            // Initialize controls
            this.controls.init(this.gba.keypad);
            
            // Start the emulator
            this.gba.runStable();
            console.log('Emulator started');
        }
    }

    pause() {
        if (this.romLoaded && !this.paused) {
            this.gba.pause();
            this.paused = true;
        }
    }

    resume() {
        if (this.romLoaded && this.paused) {
            this.gba.runStable();
            this.paused = false;
        }
    }

    _updateFPS() {
        if (!this.romLoaded || this.paused) {
            this.fpsCounter.textContent = '0 FPS';
            return;
        }
        
        this.fps = this.frameCount;
        this.frameCount = 0;
        this.fpsCounter.textContent = `${this.fps} FPS`;
    }
}

// Initialize the emulator when the page is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make sure the GameBoyAdvance constructor is available
    if (typeof window.GameBoyAdvance !== 'function') {
        console.error('GameBoyAdvance library not loaded correctly');
        return;
    }
    
    window.emulator = new GBAEmulator();
});