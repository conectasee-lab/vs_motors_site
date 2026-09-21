/** Opening hours in minutes since midnight, keyed by weekday (0 = Sunday). Null = closed all day. */
export const STORE_TZ = "America/Sao_Paulo";

type Slot = { open: number; close: number } | null;

const WEEKDAY: Slot = { open: 8 * 60 + 30, close: 18 * 60 };
const SATURDAY: Slot = { open: 8 * 60 + 30, close: 14 * 60 };

export const HOURS_BY_DAY: Slot[] = [null, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, WEEKDAY, SATURDAY];

export const HOURS_ROWS = [
  { label: "Segunda a sexta", days: [1, 2, 3, 4, 5], text: "8:30 às 18:00" },
  { label: "Sábado", days: [6], text: "8:30 às 14:00" },
  { label: "Domingo", days: [0], text: "Fechado" },
];

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}:00` : `${h}:${String(m).padStart(2, "0")}`;
}

export type StoreStatus = { day: number; open: boolean; message: string };

export function getStoreStatus(now: Date = new Date()): StoreStatus {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TZ,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = WEEKDAY_INDEX[get("weekday")] ?? 0;
  const minutes = Number(get("hour")) * 60 + Number(get("minute"));

  const today = HOURS_BY_DAY[day];
  if (today && minutes >= today.open && minutes < today.close) {
    return { day, open: true, message: `Aberto agora, fechamos às ${formatTime(today.close)}` };
  }
  if (today && minutes < today.open) {
    return { day, open: false, message: `Fechado, abrimos hoje às ${formatTime(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const nextDay = (day + i) % 7;
    const slot = HOURS_BY_DAY[nextDay];
    if (slot) {
      const when = i === 1 ? "amanhã" : ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][nextDay];
      return { day, open: false, message: `Fechado, abrimos ${when} às ${formatTime(slot.open)}` };
    }
  }
  return { day, open: false, message: "Fechado" };
}
