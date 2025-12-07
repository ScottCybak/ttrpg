import { ICON } from 'icon';
import { Elevation } from './elevation';
import { MapEdit } from './map-edit';
import { TextureSelect } from './texture-select';

export enum TOOL {
    NONE = 0,
    MAP_EDIT = 1 << 0,
    TEXTURE_PAINT = 1 << 1,
    ELEVATION = 1 << 2,
    WALL = 1 << 3
};

export type ValidTools =
    typeof TextureSelect
    | typeof Elevation
    | typeof MapEdit;

export const tools: [TOOL, ICON, ValidTools, string, string][] = [
    [TOOL.MAP_EDIT, ICON.SETTINGS, MapEdit, '1', 'edit/create map'],
    [TOOL.TEXTURE_PAINT, ICON.CUBE, TextureSelect, '2', 'textures'],
    [TOOL.ELEVATION, ICON.ELEVATION, Elevation, '3', 'elevations'],
];