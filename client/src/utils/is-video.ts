export default function isVideo(item?: string) {
  if (!item) return false;

  const videos = ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv", "m4v"];

  return videos.includes(item.toLowerCase());
}
