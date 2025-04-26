/**
 * Utility functions for the GBA emulator
 */

// Convert an ArrayBuffer to a Base64 string
export function arrayBufferToBase64(buffer) {
    const binary = [];
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary.push(String.fromCharCode(bytes[i]));
    }
    return window.btoa(binary.join(''));
}

// Convert a Base64 string to an ArrayBuffer
export function base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

// Read a file as ArrayBuffer
export function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}

// Add key binding support
export function setupKeyBindings(keyMap, keydownCallback, keyupCallback) {
    document.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (keyMap[key] && !event.repeat) {
            event.preventDefault();
            keydownCallback(keyMap[key]);
        }
    });

    document.addEventListener('keyup', (event) => {
        const key = event.key.toLowerCase();
        if (keyMap[key]) {
            event.preventDefault();
            keyupCallback(keyMap[key]);
        }
    });
}

// Create and trigger a download of a file
export function downloadFile(data, filename, type) {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

