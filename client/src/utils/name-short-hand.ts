export default function nameShortHand(name: string) {
  const nameSplit = name?.split(" ");
  const firstLetter = nameSplit[0]?.charAt(0);
  const lastLetter = nameSplit[nameSplit?.length - 1]?.charAt(0);
  return (firstLetter + lastLetter)?.toUpperCase();
}
