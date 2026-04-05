export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [hh, mm] = timeStr.split(':').map(Number);
  const totalMin = hh * 60 + mm + minutes;
  const newHh = Math.floor(totalMin / 60) % 24;
  const newMm = totalMin % 60;
  return `${newHh.toString().padStart(2, '0')}:${newMm.toString().padStart(2, '0')}`;
}

export function addHoursToTime(timeStr: string, hours: number): string {
  return addMinutesToTime(timeStr, hours * 60);
}

export function checkTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMin = (t: string | undefined): number => {
    if (!t) return 0;
    // Safely extract just HH:mm
    const cleaned = t.slice(0, 5);
    const [h, m] = cleaned.split(':').map(Number);
    return (h * 60) + m;
  };
  
  const s1 = toMin(start1);
  const e1 = toMin(end1);
  const s2 = toMin(start2);
  const e2 = toMin(end2);
  
  return s1 < e2 && e1 > s2;
}

export function getLocalISTDate(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 330);
  return d.toISOString().slice(0, 10);
}

export function getLocalISTTime(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset() + 330);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}
