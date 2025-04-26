export class GamepadControls {
    constructor(emulator) {
        this.emulator = emulator;
        this.keypad = null;
        this.buttonElements = {};
        this.keyMap = {
            'arrowup': 'UP',
            'w': 'UP',
            'arrowdown': 'DOWN',
            's': 'DOWN',
            'arrowleft': 'LEFT',
            'a': 'LEFT',
            'arrowright': 'RIGHT',
            'd': 'RIGHT',
            'z': 'A',
            'x': 'B',
            'c': 'START',
            'v': 'SELECT',
            'q': 'L',
            'e': 'R'
        };
        
        this.touchControls = {};
    }

    init(keypad) {
        this.keypad = keypad;
        this._setupButtonElements();
        this._setupKeyboardControls();
        this._setupTouchControls();
    }

    _setupButtonElements() {
        this.buttonElements = {
            'UP': document.getElementById('up'),
            'DOWN': document.getElementById('down'),
            'LEFT': document.getElementById('left'),
            'RIGHT': document.getElementById('right'),
            'A': document.getElementById('a'),
            'B': document.getElementById('b'),
            'START': document.getElementById('start'),
            'SELECT': document.getElementById('select'),
            'L': document.getElementById('l'),
            'R': document.getElementById('r')
        };
    }

    _setupKeyboardControls() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            if (this.keyMap[key] && !event.repeat) {
                event.preventDefault();
                this._pressButton(this.keyMap[key]);
            }
        });

        document.addEventListener('keyup', (event) => {
            const key = event.key.toLowerCase();
            if (this.keyMap[key]) {
                event.preventDefault();
                this._releaseButton(this.keyMap[key]);
            }
        });
    }

    _setupTouchControls() {
        Object.entries(this.buttonElements).forEach(([button, element]) => {
            if (!element) return;
            
            // Handle both touch and mouse events for mobile & desktop
            element.addEventListener('mousedown', () => this._pressButton(button));
            element.addEventListener('mouseup', () => this._releaseButton(button));
            element.addEventListener('mouseleave', () => this._releaseButton(button));
            
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this._pressButton(button);
            });
            
            element.addEventListener('touchend', (e) => {
                e.preventDefault();
                this._releaseButton(button);
            });
        });
    }

    _pressButton(button) {
        if (!this.keypad) return;
        
        // Add active class to button for visual feedback
        const element = this.buttonElements[button];
        if (element) element.classList.add('active');
        
        // Press the button in the emulator
        if (this.keypad['KEY_' + button] !== undefined) {
            this.keypad.press(this.keypad['KEY_' + button]);
        }
    }

    _releaseButton(button) {
        if (!this.keypad) return;
        
        // Remove active class from button
        const element = this.buttonElements[button];
        if (element) element.classList.remove('active');
        
        // Release the button in the emulator
        if (this.keypad['KEY_' + button] !== undefined) {
            this.keypad.release(this.keypad['KEY_' + button]);
        }
    }
}

export default GamepadControls;

