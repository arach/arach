const enabled =
  !process.env.NO_COLOR &&
  process.env.FORCE_COLOR !== "0" &&
  process.stdout.isTTY !== false;

const esc = (code: string) => (enabled ? `\x1b[${code}m` : "");

export const reset = esc("0");
export const bold = esc("1");
export const dim = esc("2");
export const italic = esc("3");
export const underline = esc("4");

// Foreground
export const white = esc("97");
export const gray = esc("90");
export const cyan = esc("36");
export const yellow = esc("33");
export const green = esc("32");
export const magenta = esc("35");
export const blue = esc("34");

export const c = {
  reset,
  bold,
  dim,
  italic,
  underline,
  white,
  gray,
  cyan,
  yellow,
  green,
  magenta,
  blue,
};
