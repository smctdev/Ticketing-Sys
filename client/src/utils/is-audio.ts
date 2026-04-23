export default function isAudio(item?: string) {
  if (!item) return false;

  const audios = ["mp3", "wav", "ogg", "m4a", "flac", "aac"];

  return audios.includes(item.toLowerCase());
}
