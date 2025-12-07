import { ToolBase } from "./tool-base";

export class WallObject extends ToolBase<HTMLElement, any> {
    toolCssClass = 'object-wall';

    show() {
        super.show();
    }
}