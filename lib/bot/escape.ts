export function escapeMarkdown(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
