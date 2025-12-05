const ignoreTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

class KeyboardInput {

    private readonly keysDown = new Set<string>();
    private readonly hotKeyCallbacks: {[key: string]: (() => void)[]} = {};
    
    constructor() {
        this.createListeners();
    }

    private createListeners(): void {
        window.addEventListener('keydown', evt => {
            if (!evt.repeat) {
                this.keysDown.add(evt.key.toLowerCase());
                this.checkForHotKeys(evt);
            }
        });
        window.addEventListener('keyup', evt => this.keysDown.delete(evt.key.toLowerCase()));
        window.addEventListener('blur', () => this.keysDown.clear());
    }

    has(key: string): boolean {
        return this.keysDown.has(key);
    }

    registerHotKey(hotKey: string, action: () => void) {
        const hkc = this.hotKeyCallbacks;
        let existing = hkc[hotKey];
        if (!existing) {
            existing = this.hotKeyCallbacks[hotKey] = [];
        }
        existing.push(action);
    }

    private checkForHotKeys(evt: KeyboardEvent) {
        const { keysDown } = this;
        const t = evt.target as HTMLElement;
        if (t && ignoreTags.has(t.tagName)) return;
        Object.entries(this.hotKeyCallbacks)
            .filter(([key]) => keysDown.has(key))
            .map(([_, cbArr]) => cbArr)
            .flat()
            .forEach(cb => cb());12        
    }
}

export const keyboardInput = new KeyboardInput();