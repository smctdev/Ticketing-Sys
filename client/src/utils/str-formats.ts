export function strPlural(length: number, content: string) {
  return length > 1 ? `${content}s` : content;
}
