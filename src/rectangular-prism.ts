import { FACE } from "def/face";
import { TEXTURE } from "def/texture";
import { domCreate } from "domCreate";

export interface RectangularPrismData {
    width: number;
    height: number;
    depth: number;
}

const optionalFaces = [FACE.NORTH, FACE.SOUTH, FACE.EAST, FACE.WEST];

export class RectangularPrism {
    private _depth!: number;

    constructor(
        public readonly element: HTMLElement,
        private data: RectangularPrismData,
        private textures: {[key in FACE]?: TEXTURE} = {},
    ) {
        this.depth = data.depth;
    }

    set depth(depth: number) {
        if (depth !== this._depth) {
            this._depth = depth;
            this.create();
        }
    }
    get depth() {
        return this._depth ?? 0;
    }

    create() {
        const style = this.element.style;
        this.element.classList.add('rectangular-prism');
        style.width = this.data.width + 'px';
        style.height = this.data.height + 'px';
        const faces = [this.createFace(FACE.TOP)];
        if (this._depth) {
            optionalFaces.forEach(f => faces.push(this.createFace(f)));
        }
        faces.forEach(e => this.element.appendChild(e))
    }

    private createFace(face: FACE): HTMLElement {
        const e = domCreate('div', {
            classList: ['face', `face-${face}`]
        });
        const textures = this.textures;
        const hasDepth = !!this.depth;
        const width = this.data.width + 'px';
        const height = this.data.height + 'px';
        const depth = this.depth + 'px';
        const style = e.style;
        switch (face) {
            case FACE.TOP:
                style.width = width;
                style.height = height;
                if (hasDepth) {
                    style.transform = `translateZ(${depth})`;
                    style.filter = `brightness(1.1)`;
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

    // private createFaceOld(face: FACE, tileSizePx: number, elevationStepPx: number, options: TileOptions): HTMLElement {
    //         const e = domCreate('div', {
    //             classList: ['face', `face-${face}`]
    //         });
    //         const style = e.style;
    //         const depth = (options.e ?? 0) * elevationStepPx;
    //         const t = `${tileSizePx}px`;
    //         const h = `${depth}px`;
    //         const textures = options.t;
        
    //         switch (face) {
    //             case FACE.TOP:
    //                 style.width = style.height = t;
    //                 if (options.e) {
    //                     style.transform = `translateZ(${h})`;
    //                     style.filter = `brightness(1.1)`;
    //                 }
    //                 break;
    //             case FACE.NORTH:
    //                 style.width = t;
    //                 style.height = h;
    //                 style.transform = `rotateX(90deg)`;
    //                 break;
    //             case FACE.SOUTH:
    //                 style.width = t;
    //                 style.height = h;
    //                 style.transform = `rotateX(-90deg) translate3d(0, -${h}, ${t})`;
    //                 break;
    //             case FACE.WEST:
    //                 style.width = h;
    //                 style.height = t;
    //                 style.transform = `rotateY(-90deg)`;
    //                 break;
    //             case FACE.EAST:
    //                 style.width = h;
    //                 style.height = t;
    //                 style.transform = `rotateY(90deg) translate3d(-${h}, 0, ${t})`;
    //                 break;
    //         }
    //         if (textures?.[face]) e.classList.add('texture', textures[face]);
    //         return e;
    //     }
}