export function getParam(value) {
    if (value === undefined)
        return '';
    return Array.isArray(value) ? (value[0] ?? '') : value;
}
