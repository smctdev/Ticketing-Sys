export default function Storage(url: string | undefined) {
  return !url?.startsWith("uploads/")
    ? `${process.env.NEXT_PUBLIC_NETSUITE_STORAGE_BASE_URL}/${url}`
    : `${process.env.NEXT_PUBLIC_STORAGE_BASE_URL}/${url}`;
}
