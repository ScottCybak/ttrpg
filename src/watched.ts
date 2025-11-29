type Watcher<T> = (value: T) => void;

export interface ReadonlyWatched<T> {
    get(): T;
    derive<U>(fn: (value: T) => U): ReadonlyWatched<U>;
    watch(callback: Watcher<T>): () => void;
    watchFor(value: T, callback: Watcher<T>): () => void;
    conditional(predicate: (value: T) => boolean): ReadonlyWatched<T>;
}

export class Watched<T> {

    static combine<T extends any[]>(
        ...watchedList: { [K in keyof T]: (Watched<T[K]> | ReadonlyWatched<T[K]>) }
    ): ReadonlyWatched<T> {
        const initialValues: Partial<T>[] = [];
        const hasValue = new Array(watchedList.length).fill(false);
        const combined = new Watched<T>([] as unknown as T);
        watchedList.forEach((watched, index) => {
            if (!watched) debugger;
            watched.watch(value => {
                initialValues[index] = value;
                hasValue[index] = true;
                if (hasValue.every(Boolean)) {
                    combined.set([...initialValues] as T);
                }
            });
        });
        return combined.asReadonly();
    }

    private _watchers: Set<Watcher<T>> = new Set();

    constructor(
        private _value: T,
    ) { }

    set(value: T) {
        if (value !== this._value) {
            this._value = value;
            this.notify();
        }
    }

    get(): T {
        return this._value;
    }

    watch(callback: Watcher<T>): () => void {
        this._watchers.add(callback);
        callback(this._value);
        return () => {
            this._watchers.delete(callback);
        };
    }

    watchFor(value: ((v: T) => boolean) | T, callback: Watcher<T>): () => void {
        const newCallback = () => {
            if (typeof value === 'function') {
                const predicate = value as (v: T) => boolean;
                if (predicate(this._value)) {
                    callback(this._value);
                }
            } else if (value === this._value) {
                callback(this._value)
            }
        };
        this._watchers.add(newCallback);
        return () => {
            this._watchers.delete(newCallback);
        }
    }

    derive<U>(fn: (value: T) => U): ReadonlyWatched<U> {
        const initial = fn(this._value);
        const derived = new Watched<U>(initial);
        this.watch(value => {
            derived.set(fn(value));
        });
        derived.notify();
        return derived.asReadonly();
    }

    // accept a comparison fn, and only notify if the reponse is truthy
    conditional(predicate: (value: T) => boolean): ReadonlyWatched<T> {
         const derived = new Watched<T>(this._value);
        this.watch(value => {
            if (predicate(value)) {
                derived.set(value);
            }
        });
        if (!predicate(this._value)) {
            // Optionally, you can make the initial derived value undefined or skip
            // but keeping current value ensures type safety
        }
        return derived.asReadonly();
    }

    asReadonly(): ReadonlyWatched<T> {
        return {
            get: this.get.bind(this),
            derive: this.derive.bind(this),
            watch: this.watch.bind(this),
            watchFor: this.watchFor.bind(this),
            conditional: this.conditional.bind(this),
        };
    }
    
    private notify() {
        for (const callback of this._watchers) {
            callback(this._value);
        }
    }
}