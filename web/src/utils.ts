const FLAG_MAP: Record<string, string> = {
  "Australia": "🇦🇺",
  "Austria": "🇦🇹",
  "Azerbaijan": "🇦🇿",
  "Bahrain": "🇧🇭",
  "Belgium": "🇧🇪",
  "Brazil": "🇧🇷",
  "Canada": "🇨🇦",
  "China": "🇨🇳",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Hungary": "🇭🇺",
  "Italy": "🇮🇹",
  "Japan": "🇯🇵",
  "Mexico": "🇲🇽",
  "Monaco": "🇲🇨",
  "Netherlands": "🇳🇱",
  "Portugal": "🇵🇹",
  "Qatar": "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  "Singapore": "🇸🇬",
  "Spain": "🇪🇸",
  "Turkey": "🇹🇷",
  "UAE": "🇦🇪",
  "United Arab Emirates": "🇦🇪",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  "USA": "🇺🇸",
};

export function getFlag(country: string): string {
  return FLAG_MAP[country] ?? "🏁";
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
