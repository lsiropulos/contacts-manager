/**
 * Extracts uppercase initials from a full name (up to 2 characters).
 * Example: "John Doe" -> "JD"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
