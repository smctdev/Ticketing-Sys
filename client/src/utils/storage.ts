export default function Storage(url: string | undefined) {
  return `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}${url}`;
}
