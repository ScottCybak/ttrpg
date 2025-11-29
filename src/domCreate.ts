export interface DomCreateOptions {
    id?: string;
    classList?: string[];
    inner?: string;
    style?: string;
    value?: string;
}

export const domCreate = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: DomCreateOptions = {},
    appendTo?: HTMLElement,
): HTMLElementTagNameMap[K] => {
    const element = document.createElement(tag);
    const { id, classList, inner, style, value } = options;
    if (id) element.id = id;
    if (classList?.length) element.classList.add(...classList);
    if (inner) element.innerHTML = inner;
    if (style) element.style.cssText = style;
    if (appendTo) appendTo.appendChild(element);
    if (value) element.setAttribute('value', value);
    return element;
}