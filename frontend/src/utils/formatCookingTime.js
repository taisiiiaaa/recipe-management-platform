export default function formatCookingTime(minutes, t) {
  if (!minutes || minutes <= 0) return '';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} ${t.hour} ${mins} ${t.min}`;
  } else if (hours > 0) {
    return `${hours} ${t.hour}`;
  } else {
    return `${mins} ${t.min}`;
  }
}
