export function formatLicensePlate(value: string) {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let i = 0;
  let province = "";
  while (i < raw.length && province.length < 2 && /\d/.test(raw[i])) {
    province += raw[i++];
  }
  let series = "";
  while (i < raw.length && series.length < 2 && /[A-Z]/.test(raw[i])) {
    series += raw[i++];
  }
  let numbers = "";
  while (i < raw.length && numbers.length < 5 && /\d/.test(raw[i])) {
    numbers += raw[i++];
  }
  let result = province + series;
  if (numbers.length) {
    result += `-${numbers.slice(0, 3)}`;
    if (numbers.length > 3) result += `.${numbers.slice(3)}`;
  }
  return result;
}

export function isValidLicensePlate(value: string) {
  const plate = value.trim();
  if (!plate) return true;
  return /^\d{2}[A-Z]{1,2}-\d{3}\.\d{2}$/.test(plate);
}
