export default function RegExpEscape(string, flags) {
  return RegExp(string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
}
