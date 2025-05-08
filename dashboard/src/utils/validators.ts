const slugRe = /^[-_0-9a-z]{3,}$/;
const urlRe = /^https?:\/\/.{3,}$/;
const addrRe = /^[-_0-9a-z.]+:[0-9]+$/;
const selectorRe = /^{.+=.+}$/;
const emailRe = /[^@\r\n\t\f\v ]+@[^@\r\n\t\f\v ]+\.[a-z]+/;

export function notEmpty(v: string) {
    return !!v || 'required';
}

export function isSlug(v: string) {
    return slugRe.test(v) || '3 or more letters/numbers, lower case';
}

export function isUrl(v: string) {
    return !v || urlRe.test(v) || 'a valid URL is required, e.g. http://HOST:PORT';
}

export function isAddr(v: string) {
    return !v || addrRe.test(v) || 'a valid address is required, e.g. HOST:PORT';
}

export function isFloat(v: string) {
    return !isNaN(parseFloat(v)) || 'number is required';
}

export function isPrometheusSelector(v: string) {
    return !v || selectorRe.test(v) || 'a valid Prometheus selector is required, e.g. {label_name="label_value", another_label=~"some_regexp"}';
}

export function isEmail(email: string) {
    return emailRe.test(email) || 'invalid email';
}
