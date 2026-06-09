export function normalizePhoneNumber(phone: string): string {
  if (!phone) return phone;

  let cleaned = phone.replace(/[\s\-\(\)\+]/g, "");

  if (cleaned.startsWith("00")) {
    cleaned = cleaned.replace(/^00/, "");
  }

  if (cleaned.startsWith("05") && cleaned.length === 10) {
    cleaned = "966" + cleaned.substring(1);
  } else if (cleaned.startsWith("5") && cleaned.length === 9) {
    cleaned = "966" + cleaned;
  } else if (cleaned.startsWith("96605")) {
    cleaned = "966" + cleaned.substring(4);
  } else if (!cleaned.startsWith("966")) {
    if (cleaned.startsWith("0")) {
      cleaned = "966" + cleaned.substring(1);
    } else if (cleaned.startsWith("1") || cleaned.startsWith("2") || cleaned.startsWith("5")) {
      cleaned = "966" + cleaned;
    }
  }

  return cleaned;
}

export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.startsWith("966") && normalized.length === 12) {
    return `+${normalized.substring(0, 3)} ${normalized.substring(3, 5)} ${normalized.substring(5, 9)} ${normalized.substring(9)}`;
  }
  return `+${normalized}`;
}
