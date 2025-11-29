import { faceLabels } from "def/face";
import { FORM_CONTROL_TYPE, FormControl } from "def/form";
import { MOVEMENT, movementLabels } from "def/movement";
import { textureLabels } from "def/texture";

export enum FACE {
    TOP = 't',
    NORTH = 'n',
    SOUTH = 's',
    EAST = 'e',
    WEST = 'w',
}

// holds our options for the individual dropdowns
const textureOptions = Object.entries(textureLabels).map(([value, label]) => ({ value, label }));
const textureSelects: FormControl[] = Object.entries(faceLabels)
    .map(([property, label]) => ({
        property,
        label,
        type: FORM_CONTROL_TYPE.SELECT,
        options: textureOptions
}));

export const mapForm: FormControl[] = [
    { property: 'id', type: FORM_CONTROL_TYPE.HIDDEN },
    { property: 'name', type: FORM_CONTROL_TYPE.TEXT, label: 'Name' },
    { type: FORM_CONTROL_TYPE.HEADING, label: 'Grid'},
    { property: 'rows', type: FORM_CONTROL_TYPE.NUMBER, min: 1, max: 100 },
    { property: 'columns', type: FORM_CONTROL_TYPE.NUMBER, min: 1, max: 100 },
    { property: 'tileSizePx', label: 'tile size', type: FORM_CONTROL_TYPE.SELECT, returnType: FORM_CONTROL_TYPE.NUMBER, options: [
        { value: 32, label: 'Small' },
        { value: 64, label: 'Medium' },
        { value: 128, label: 'Large' },
        { value: 256, label: 'XL' },
    ]},
    { property: 'elevationStepPx', label: 'elevated step size', type: FORM_CONTROL_TYPE.SELECT, returnType: FORM_CONTROL_TYPE.NUMBER, options: [
        { value: 8, label: 'Small' },
        { value: 16, label: 'Medium' },
        { value: 32, label: 'Large' },
        { value: 64, label: 'XL' },
    ]},
    { type: FORM_CONTROL_TYPE.HEADING, label: 'Zoom'},
    { property: 'zoomMin', type: FORM_CONTROL_TYPE.NUMBER, min: 0.25, max: 1, step: 0.05 },
    { property: 'zoomMax', type: FORM_CONTROL_TYPE.NUMBER, min: 1, max: 2, step: 0.05 },
    { property: 'zoomStep', type: FORM_CONTROL_TYPE.NUMBER, min: 0.01, max: 0.1, step: 0.01 },
    { property: 'zoomThrottle', type: FORM_CONTROL_TYPE.NUMBER, min: 16, max: 256, step: 8 },
    { property: 'defaultTileData', type: FORM_CONTROL_TYPE.OBJECT, controls: [
        { property: 'elevation', label: 'Elavation', type: FORM_CONTROL_TYPE.NUMBER, min: 0, max: 25 },
        { property: 'texture', type: FORM_CONTROL_TYPE.OBJECT, controls: textureSelects},  // especial
        { property: 'movement', label: 'Difficulty', type: FORM_CONTROL_TYPE.SELECT, options: [
            ...Object.values(MOVEMENT).map(k => ({
                value: k,
                label: movementLabels[k],
            })),
        ]},
    ]}
];
