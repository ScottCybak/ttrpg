export interface DomCreateOptions {
    id?: string;
    classList?: string[];
    inner?: string;
    style?: string;
    value?: string;
    title?: string;
    dataset?: Record<string, string>;
}

export const domCreate = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    options: DomCreateOptions = {},
    appendTo?: HTMLElement,
    // alt?: 
): HTMLElementTagNameMap[K] => {
    const element = document.createElement(tag);
    const { id, classList, inner, style, value, title, dataset } = options;
    if (id) element.id = id;
    if (classList?.length) element.classList.add(...classList);
    if (inner) element.innerHTML = inner;
    if (style) element.style.cssText = style;
    if (value) element.setAttribute('value', value);
    if (title) element.title = title;
    if (dataset) Object.entries(dataset).forEach(([k,v]) => element.dataset[k] = v);
    // finally, stick er in
    if (appendTo) appendTo.appendChild(element);
    return element;
}