
class KeyboardInput {

    private readonly keysDown = new Set<string>();
    
    constructor() {
        this.createListeners();
    }

    private createListeners(): void {
        window.addEventListener('keydown', evt => {
            if (!evt.repeat) {
                this.keysDown.add(evt.key.toLowerCase());
            }
        });
        window.addEventListener('keyup', evt => this.keysDown.delete(evt.key.toLowerCase()));
        window.addEventListener('blur', () => this.keysDown.clear());
    }

    has(key: string): boolean {
        return this.keysDown.has(key);
    }
}

export const keyboardInput = new KeyboardInput();