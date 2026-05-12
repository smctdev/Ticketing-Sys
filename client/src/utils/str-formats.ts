import pluralize from "pluralize";

export function strPlural(length: number, content: string) {
  return pluralize(content, length);
}
