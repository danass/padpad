/**
 * Fixes the mangled UTF-8 encoding common in Instagram JSON exports.
 * Instagram exports UTF-8 bytes as if they were Latin-1 characters.
 * Example: "\u00c3\u00a0" -> "à"
 */
export function decodeInstagramString(str) {
    if (typeof str !== 'string') return str;
    try {
        // This is a common trick to fix the encoding issue:
        // 1. escape() converts characters to %HH format based on their char codes (interpreted as Latin-1)
        // 2. decodeURIComponent() interprets those %HH sequences as UTF-8
        return decodeURIComponent(escape(str));
    } catch (e) {
        // Fallback to original string if decoding fails
        return str;
    }
}

/**
 * Recursively decodes all strings in an Instagram JSON object.
 */
export function decodeInstagramObject(obj) {
    if (!obj) return obj;

    if (typeof obj === 'string') {
        return decodeInstagramString(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(decodeInstagramObject);
    }

    if (typeof obj === 'object') {
        const decoded = {};
        for (const [key, value] of Object.entries(obj)) {
            decoded[key] = decodeInstagramObject(value);
        }
        return decoded;
    }

    return obj;
}
