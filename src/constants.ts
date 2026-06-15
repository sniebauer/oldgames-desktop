export const TASKBAR_H = 36;

// --- Win95 window chrome geometry ---------------------------------------
// Authentic Windows 95 metrics. The react95 <Window> draws the raised 3D
// frame and contributes FRAME_PAD px of "sizing border" on every side; our
// own caption bar is CAPTION_H tall. CHROME_W / CHROME_H are the total
// non-content overhead, so a native WxH game fits exactly in a
// (W + CHROME_W) x (H + CHROME_H) window.
export const CAPTION_H = 18; // navy title bar height (SM_CYCAPTION-ish)
export const FRAME_PAD = 4; // resizable sizing border (SM_CXFRAME)
export const CHROME_W = FRAME_PAD * 2;
export const CHROME_H = FRAME_PAD * 2 + CAPTION_H;

// Smallest a window may be dragged to while resizing.
export const MIN_W = 180;
export const MIN_H = 120;
