const itemKey = 'coroot';

function getOrSet(stor: any, key: string, value: any) {
    const data = JSON.parse(stor.getItem(itemKey) || '{}');
    if (!value) {
        return data[key];
    }
    data[key] = value;
    stor.setItem(itemKey, JSON.stringify(data));
    return value;
}

export function local(key: string, value?: any) {
    return getOrSet(localStorage, key, value);
}

export function session(key: string, value?: any) {
    return getOrSet(sessionStorage, key, value);
}
