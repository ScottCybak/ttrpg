import { FACE } from "def/face";
import { TileOptions } from "def/tile-options";
import { domCreate } from "domCreate";

export interface RectangularPrismData {
    width: number;
    height: number;
    depth: number;
}

const allFaces = [FACE.TOP, FACE.NORTH, FACE.SOUTH, FACE.EAST, FACE.WEST];

export class RectangularPrism {
    private _depth!: number;

    constructor(
        public readonly element: HTMLElement,
        private data: RectangularPrismData,
        private options?: TileOptions,
    ) {
        this.depth = data.depth;
    }

    set depth(depth: number) {
        if (depth !== this._depth) {
            this._depth = depth;
            this.generate();
        }
    }
    get depth() {
        return this._depth ?? 0;
    }

    generate() {
        const e = this.element;
        const style = e.style;
        e.classList.add('rectangular-prism');
        style.width = this.data.width + 'px';
        style.height = this.data.height + 'px';
        [...e.childNodes].forEach(c => e.removeChild(c));
        allFaces.forEach(f => this.generateFace(f, e));
    }

    destroy() {
        [...this.element?.childNodes].forEach(n => this.element.removeChild(n));
        this.element?.parentElement?.removeChild(this.element);
    }

    private generateFace(face: FACE, appendTo: HTMLElement): HTMLElement | undefined {
        const hasDepth = !!this.depth;
        if (!hasDepth && face !== FACE.TOP) {
            return;
        }
        const e = domCreate('div', {
            classList: ['face', `face-${face}`]
        }, appendTo);
        const o = this.options ?? {};
        const textures = o.texture;
        const width = this.data.width + 'px';
        const height = this.data.height + 'px';
        const depth = this.depth + 'px';
        const style = e.style;
        switch (face) {
            case FACE.TOP:
                style.width = width;
                style.height = height;
                if (this.depth) {
                    
                }
                if (hasDepth) {
                    e.dataset.steps = `${o.elevation}`;
                    const brightness = 1 + ((o.elevation ?? 0) / 50);
                    style.transform = `translateZ(${depth})`;
                    style.filter = `brightness(${brightness})`;
                }
                break;
            case FACE.NORTH:
                style.width = width;
                style.height = depth;
                style.transform = `rotateX(90deg)`;
                break;
             case FACE.SOUTH:
                style.width = width;
                style.height = depth;
                style.transform = `rotateX(-90deg) translate3d(0, -${depth}, ${width})`;
                break;
            case FACE.WEST:
                style.width = depth;
                style.height = height;
                style.transform = `rotateY(-90deg)`;
                break;
            case FACE.EAST:
                style.width = depth;
                style.height = height;
                style.transform = `rotateY(90deg) translate3d(-${depth}, 0, ${width})`;
                break;
        }
        if (textures?.[face]) e.classList.add('texture', textures[face]);
        return e;
    }
}