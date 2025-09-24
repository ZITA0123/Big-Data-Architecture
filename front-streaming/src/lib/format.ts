export const fmtNum = (n: number | undefined | null, digits = 4) => {
if (n === undefined || n === null || Number.isNaN(n)) return "—";
const abs = Math.abs(n);
const d = abs >= 100 ? 2 : digits;
return n.toLocaleString(undefined, { maximumFractionDigits: d });
};


export const fmtPct = (n: number | undefined | null, digits = 2) => {
if (n === undefined || n === null || Number.isNaN(n)) return "—";
return `${n.toFixed(digits)}%`;
};


export const fmtTime = (ms: number) => new Date(ms).toLocaleTimeString();


export const toNumber = (s: string | number | undefined): number => {
if (typeof s === 'number') return s;
if (!s) return NaN;
const n = Number(s);
return Number.isFinite(n) ? n : NaN;
};