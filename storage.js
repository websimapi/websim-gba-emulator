import { arrayBufferToBase64, base64ToArrayBuffer } from './utils.js';

const STORAGE_PREFIX = 'com.gba-emulator';

export class StorageManager {
    constructor() {
        this.supportsLocalStorage = this._checkLocalStorageSupport();
    }

    _checkLocalStorageSupport() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    getStorageKey(type, id) {
        return `${STORAGE_PREFIX}.${type}.${id}`;
    }

    // Save data to local storage
    saveData(type, id, data) {
        if (!this.supportsLocalStorage) return false;
        
        try {
            const key = this.getStorageKey(type, id);
            const base64Data = data instanceof ArrayBuffer 
                ? arrayBufferToBase64(data) 
                : JSON.stringify(data);
            
            localStorage.setItem(key, base64Data);
            return true;
        } catch (e) {
            console.error('Error saving data to localStorage:', e);
            return false;
        }
    }

    // Load data from local storage
    loadData(type, id, isArrayBuffer = false) {
        if (!this.supportsLocalStorage) return null;
        
        try {
            const key = this.getStorageKey(type, id);
            const data = localStorage.getItem(key);
            
            if (!data) return null;
            
            return isArrayBuffer ? base64ToArrayBuffer(data) : JSON.parse(data);
        } catch (e) {
            console.error('Error loading data from localStorage:', e);
            return null;
        }
    }

    // Delete data from local storage
    deleteData(type, id) {
        if (!this.supportsLocalStorage) return false;
        
        try {
            const key = this.getStorageKey(type, id);
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error deleting data from localStorage:', e);
            return false;
        }
    }

    // List all saved data of a specific type
    listSavedData(type) {
        if (!this.supportsLocalStorage) return [];
        
        const keys = [];
        const prefix = `${STORAGE_PREFIX}.${type}.`;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                keys.push(key.substring(prefix.length));
            }
        }
        
        return keys;
    }
}

export default new StorageManager();

