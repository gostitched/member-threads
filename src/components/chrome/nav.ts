/** "How It Works" -> "How it works". Chrome speaks in sentence case (DESIGN.md §8). */
export function sentence(label: string) {
  return label.charAt(0) + label.slice(1).toLowerCase();
}
