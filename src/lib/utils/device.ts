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
 * Determines whether a model string is a generic or placeholder token
 * (e.g. "K" from Chrome User-Agent Reduction, "U", "generic", "build", etc.)
 */
export function isInvalidDeviceToken(model: string | null | undefined): boolean {
    if (!model) return true;
    const trimmed = model.trim();
    if (trimmed.length <= 1) return true;

    const lower = trimmed.toLowerCase();
    const placeholderTokens = new Set([
        'k',
        'u',
        'null',
        'undefined',
        'none',
        'unknown',
        'generic',
        'default',
        'device',
        'phone',
        'tablet',
        'mobile',
        'android',
        'build',
        'arm',
        'arm64',
        'x86',
        'x86_64',
        'linux',
        'wv',
        'sm-',
    ]);

    if (placeholderTokens.has(lower)) {
        return true;
    }

    if (/^(android|mobile|tablet|build|generic|linux|device|phone)$/i.test(lower)) {
        return true;
    }

    return false;
}

/**
 * Extracts an Android model from the browser User-Agent.
 * Returns null if the model is absent or a reduced/placeholder token (like "K").
 */
export function extractAndroidModel(userAgent: string): string | null {
    const match = userAgent.match(
        /Android[^;]*;\s*(?:[a-z]{2}(?:-[a-z]{2})?;\s*)?([^;)]+?)(?:\s+Build\/[^;)]+)?\s*[;)]/i
    );

    if (!match) {
        return null;
    }

    const rawModel = match[1].trim();

    if (isInvalidDeviceToken(rawModel)) {
        return null;
    }

    return rawModel;
}

/**
 * Determines the manufacturer from common Android model prefixes.
 */
export function getAndroidBrand(model: string): string {
    const upperModel = model.trim().toUpperCase();

    // Samsung: SM-*, GT-*, SCH-*, SGH-*, SHV-*, SAMSUNG*
    if (/^(SM-|GT-|SCH-|SGH-|SHV-|SAMSUNG)/i.test(upperModel)) {
        return 'Samsung';
    }

    // Realme: RMX*, RM*
    if (/^RM[X0-9]/i.test(upperModel) || /realme/i.test(upperModel)) {
        return 'Realme';
    }

    // OnePlus: ONEPLUS*, IN2*, NE2*, GM1*, HD1*, KB2*, EB2*, CPH24*, etc.
    if (/^(ONEPLUS|IN2|NE2|GM1|HD1|KB2|EB2|CPH24|CPH25)/i.test(upperModel) || /oneplus/i.test(upperModel)) {
        return 'OnePlus';
    }

    // OPPO: CPH*, PCH*, PEM*, PEA*, PEE*, PED*, PGZ*, PJE*, FIND*, RENO*
    if (/^(CPH|PCH|PEM|PEA|PEE|PED|PGZ|PJE|FIND|RENO)/i.test(upperModel) || /oppo/i.test(upperModel)) {
        return 'OPPO';
    }

    // Vivo / iQOO: V2*, V1*, PD*, Y*, I2*, IQOO*
    if (/^(V2[0-9]|V1[0-9]|PD[0-9]|Y[0-9]|I2[0-9]|IQOO)/i.test(upperModel) || /vivo|iqoo/i.test(upperModel)) {
        return 'vivo';
    }

    // Xiaomi / Redmi / POCO: 22*, 23*, 24*, M20*, M21*, 210*, 220*, REDMI*, POCO*, MI *
    if (/^(2[1-4][0-9]{2}|M20|M21|REDMI|POCO|MI\s)/i.test(upperModel) || /xiaomi|redmi|poco/i.test(upperModel)) {
        return 'Xiaomi';
    }

    // Google Pixel: Pixel*, PIXEL*
    if (/^PIXEL/i.test(upperModel) || /google/i.test(upperModel)) {
        return 'Google';
    }

    // Motorola: XT*, MOTO*
    if (/^(XT[0-9]|MOTO)/i.test(upperModel) || /motorola/i.test(upperModel)) {
        return 'Motorola';
    }

    // Nothing Phone: A063, A065, NOTHING*
    if (/^(A063|A065|AIN065|NOTHING)/i.test(upperModel) || /nothing/i.test(upperModel)) {
        return 'Nothing';
    }

    // Asus: ASUS*, ROG*, ZS*, ZB*, ZF*
    if (/^(ASUS|ROG|ZS[0-9]|ZB[0-9]|ZF[0-9])/i.test(upperModel) || /asus/i.test(upperModel)) {
        return 'Asus';
    }

    // Sony: Xperia*, SO-*, SOG-*, XQ-*
    if (/^(XPERIA|SO-|SOG-|XQ-)/i.test(upperModel) || /sony/i.test(upperModel)) {
        return 'Sony';
    }

    // Huawei / Honor: HWI*, LYA*, ELS*, ANA*, VOG*, MAR*, POT*, JNY*, HONOR*, HUAWEI*
    if (/^(HWI|LYA|ELS|ANA|VOG|MAR|POT|JNY|HONOR|HUAWEI)/i.test(upperModel)) {
        return 'Huawei';
    }

    return '';
}

/**
 * Formats a clean, readable Android device name.
 */
export function formatAndroidDeviceName(model: string, isTablet: boolean): string {
    const cleanModel = model.trim();

    if (!cleanModel || isInvalidDeviceToken(cleanModel)) {
        return isTablet ? 'Android Tablet' : 'Android Phone';
    }

    const brand = getAndroidBrand(cleanModel);

    if (!brand) {
        if (/^android/i.test(cleanModel)) {
            return cleanModel;
        }
        return `Android ${cleanModel}`;
    }

    if (cleanModel.toLowerCase().startsWith(brand.toLowerCase())) {
        return cleanModel;
    }

    return `${brand} ${cleanModel}`;
}

/**
 * Detects simple, human-readable device information synchronously.
 *
 * Handles User-Agent reduction (e.g. Chrome's "Android 10; K"), iPadOS desktop mode,
 * Windows, macOS, Linux, ChromeOS, and mobile devices with clean fallbacks.
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
    const maxTouch = navigator.maxTouchPoints || 0;

    // 1. iPhone / iPod (checked first before Mac/iPad because iOS UA contains "like Mac OS X")
    if (/iphone/.test(ua)) {
        return {
            name: 'iPhone',
            type: 'phone',
        };
    }

    if (/ipod/.test(ua)) {
        return {
            name: 'iPod Touch',
            type: 'phone',
        };
    }

    // 2. iPad / iPadOS (includes desktop Safari UA emulation on modern iPads: "Macintosh" + touch)
    if (
        /ipad/.test(ua) ||
        (maxTouch > 0 && /macintosh/.test(ua))
    ) {
        return {
            name: 'iPad',
            type: 'tablet',
        };
    }

    // 3. Android
    if (/android/.test(ua)) {
        const isTablet = /tablet/.test(ua) || (maxTouch > 0 && !/mobile/.test(ua));
        const model = extractAndroidModel(userAgent);

        return {
            name: model ? formatAndroidDeviceName(model, isTablet) : (isTablet ? 'Android Tablet' : 'Android Phone'),
            type: isTablet ? 'tablet' : 'phone',
        };
    }

    // 4. ChromeOS
    if (/cros/.test(ua)) {
        return {
            name: 'Chromebook',
            type: 'desktop',
        };
    }

    // 5. Windows
    if (/windows/.test(ua)) {
        return {
            name: 'Windows PC',
            type: 'desktop',
        };
    }

    // 6. macOS (Mac laptops / desktops without multi-touch)
    if (/macintosh|mac os x/.test(ua)) {
        return {
            name: 'Mac',
            type: 'desktop',
        };
    }

    // 7. Linux
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
 * Asynchronously detects device information using modern User-Agent Client Hints
 * (navigator.userAgentData) when available, falling back to getDeviceInfo().
 *
 * In modern Chromium browsers on Android, this retrieves the true hardware model
 * (e.g. "Pixel 8", "SM-S918B") that is masked as "K" in standard navigator.userAgent.
 */
export async function getDeviceInfoAsync(): Promise<DeviceInfo> {
    const fallback = getDeviceInfo();

    if (typeof window === 'undefined') {
        return fallback;
    }

    try {
        const uaData = (navigator as unknown as {
            userAgentData?: {
                mobile?: boolean;
                platform?: string;
                getHighEntropyValues?: (hints: string[]) => Promise<{
                    model?: string;
                    platform?: string;
                    platformVersion?: string;
                }>;
            };
        }).userAgentData;

        if (uaData && typeof uaData.getHighEntropyValues === 'function') {
            const highEntropy = await uaData.getHighEntropyValues(['model', 'platform', 'platformVersion']);
            const rawModel = highEntropy?.model?.trim();
            const platform = (highEntropy?.platform || uaData.platform || '').toLowerCase();
            const isMobile = uaData.mobile ?? (fallback.type === 'phone' || fallback.type === 'tablet');

            if (rawModel && !isInvalidDeviceToken(rawModel)) {
                if (platform.includes('android') || fallback.name.includes('Android')) {
                    const isTablet = fallback.type === 'tablet' || (!isMobile && platform.includes('android'));
                    return {
                        name: formatAndroidDeviceName(rawModel, isTablet),
                        type: isTablet ? 'tablet' : 'phone',
                    };
                }

                // If on another platform with a specific model
                return {
                    name: rawModel,
                    type: fallback.type,
                };
            }
        }
    } catch {
        // High entropy request rejected or failed - gracefully keep fallback
    }

    return fallback;
}

/**
 * Detects the browser name from the User-Agent string and modern browser properties.
 *
 * Order matters — Brave masks as Chrome, Edge masks as Chrome,
 * Opera masks as Chrome, etc. Check the most specific first.
 */
export function getBrowserName(): string {
    if (typeof window === 'undefined') {
        return 'Unknown';
    }

    const ua = navigator.userAgent;

    // Brave
    if (
        'brave' in navigator ||
        Boolean((navigator as unknown as { brave?: { isBrave?: () => boolean } }).brave)
    ) {
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

    // Opera / Opera GX / Opera iOS
    if (/OPR\//i.test(ua) || /Opera/i.test(ua) || /OPT\//i.test(ua) || /OpiOS/i.test(ua)) {
        return 'Opera';
    }

    // Vivaldi
    if (/Vivaldi/i.test(ua)) {
        return 'Vivaldi';
    }

    // Edge (Chromium & iOS)
    if (/Edg\//i.test(ua) || /EdgiOS/i.test(ua) || /Edge\//i.test(ua)) {
        return 'Edge';
    }

    // Firefox (Desktop, Android & iOS)
    if ((/Firefox/i.test(ua) || /FxiOS/i.test(ua)) && !/Seamonkey/i.test(ua)) {
        return 'Firefox';
    }

    // Chrome (Desktop, Android & iOS CriOS)
    if ((/Chrome/i.test(ua) || /CriOS/i.test(ua)) && !/Chromium/i.test(ua)) {
        return 'Chrome';
    }

    // Chromium
    if (/Chromium/i.test(ua)) {
        return 'Chromium';
    }

    // Safari (must be after Chrome check since Chrome UA contains Safari)
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua)) {
        return 'Safari';
    }

    return 'Unknown';
}