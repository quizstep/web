const DEVICE_ID_KEY = 'quizstep_device_id';

/**
 * Returns the unique ID for this QuizStep browser installation.
 *
 * The ID is stored in localStorage, so the same browser keeps
 * the same device ID across normal visits and logins.
 *
 * Clearing browser/site data removes it, causing a new ID
 * to be generated next time.
 */
export function getDeviceId(): string {
    if (typeof window === 'undefined') {
        throw new Error('getDeviceId() can only be called in the browser');
    }

    const existingDeviceId = localStorage.getItem(DEVICE_ID_KEY);

    if (existingDeviceId) {
        return existingDeviceId;
    }

    const newDeviceId = crypto.randomUUID();

    localStorage.setItem(DEVICE_ID_KEY, newDeviceId);

    return newDeviceId;
}

export type DeviceType = 'phone' | 'tablet' | 'desktop' | 'unknown';

export interface DeviceInfo {
    name: string;
    type: DeviceType;
}

/**
 * Detects simple, human-readable device information.
 *
 * Uses the most specific model information available from
 * the browser without trying to fingerprint the device.
 */
export function getDeviceInfo(): DeviceInfo {
    if (typeof window === 'undefined') {
        return {
            name: 'Unknown Device',
            type: 'unknown',
        };
    }

    const userAgent = navigator.userAgent;
    const ua = userAgent.toLowerCase();

    // iPad
    if (
        /ipad/.test(ua) ||
        (navigator.maxTouchPoints > 1 && /macintosh/.test(ua))
    ) {
        return {
            name: 'iPad',
            type: 'tablet',
        };
    }

    // iPhone / iPod
    if (/iphone|ipod/.test(ua)) {
        return {
            name: 'iPhone',
            type: 'phone',
        };
    }

    // Android
    if (/android/.test(ua)) {
        const model = extractAndroidModel(userAgent);

        if (model) {
            return {
                name: `${getAndroidBrand(model)} ${model}`,
                type: /tablet/.test(ua) ? 'tablet' : 'phone',
            };
        }

        return {
            name: 'Android Phone',
            type: /tablet/.test(ua) ? 'tablet' : 'phone',
        };
    }

    // ChromeOS
    if (/cros/.test(ua)) {
        return {
            name: 'Chromebook',
            type: 'desktop',
        };
    }

    // Windows
    if (/windows/.test(ua)) {
        return {
            name: 'Windows PC',
            type: 'desktop',
        };
    }

    // macOS
    if (/macintosh|mac os x/.test(ua)) {
        return {
            name: 'Mac',
            type: 'desktop',
        };
    }

    // Linux
    if (/linux/.test(ua)) {
        return {
            name: 'Linux PC',
            type: 'desktop',
        };
    }

    return {
        name: 'Unknown Device',
        type: 'unknown',
    };
}


/**
 * Detects the browser name from the User-Agent string.
 *
 * Order matters — Brave masks as Chrome, Edge masks as Chrome,
 * Opera masks as Chrome, etc. Check the most specific first.
 */
export function getBrowserName(): string {
    if (typeof window === 'undefined') {
        return 'Unknown';
    }

    const ua = navigator.userAgent;

    // Brave injects a brave property on navigator
    if ('brave' in navigator) {
        return 'Brave';
    }

    // Samsung Internet
    if (/SamsungBrowser/i.test(ua)) {
        return 'Samsung Internet';
    }

    // UC Browser
    if (/UCBrowser/i.test(ua)) {
        return 'UC Browser';
    }

    // Opera / Opera GX
    if (/OPR\//i.test(ua) || /Opera/i.test(ua)) {
        return 'Opera';
    }

    // Edge (Chromium-based)
    if (/Edg\//i.test(ua)) {
        return 'Edge';
    }

    // Firefox
    if (/Firefox/i.test(ua) && !/Seamonkey/i.test(ua)) {
        return 'Firefox';
    }

    // Chrome (must be after Edge, Opera, Brave checks)
    if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) {
        return 'Chrome';
    }

    // Chromium
    if (/Chromium/i.test(ua)) {
        return 'Chromium';
    }

    // Safari (must be after Chrome check since Chrome UA contains Safari)
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
        return 'Safari';
    }

    return 'Unknown';
}


/**
 * Extracts an Android model from the browser User-Agent.
 */
function extractAndroidModel(userAgent: string): string | null {
    const match = userAgent.match(
        /Android[^;]*;\s*(?:[a-z]{2}(?:-[A-Z]{2})?;\s*)?([^;)]+?)(?:\s+Build\/[^;)]+)?[;)]/i
    );

    if (!match) {
        return null;
    }

    const model = match[1].trim();

    if (
        !model ||
        /android|wv|mobile|tablet|build/i.test(model)
    ) {
        return null;
    }

    return model;
}


/**
 * Determines the manufacturer from common Android model prefixes.
 */
function getAndroidBrand(model: string): string {
    const upperModel = model.toUpperCase();

    if (/^(SM-|GT-|SCH-|SGH-|SHV-|SAMSUNG)/.test(upperModel)) {
        return 'Samsung';
    }

    if (/^(RMX|RM)/.test(upperModel)) {
        return 'Realme';
    }

    if (/^(CPH|PCH|PEM)/.test(upperModel)) {
        return 'OPPO';
    }

    if (/^(V|PD|Y)/.test(upperModel)) {
        return 'vivo';
    }

    if (/^(M20|M21|M200|220|230|240)/.test(upperModel)) {
        return 'Xiaomi';
    }

    if (/^PIXEL/.test(upperModel)) {
        return 'Google';
    }

    if (/^(ONEPLUS|IN|NE)/.test(upperModel)) {
        return 'OnePlus';
    }

    if (/^(XT|MOTO)/.test(upperModel)) {
        return 'Motorola';
    }

    return 'Android';
}