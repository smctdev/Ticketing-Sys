import { CONFIG } from "@/config/config";

export default function Storage(url: string | undefined) {
  return !url?.startsWith("uploads/") && !url?.startsWith("message_attachments")
    ? `${CONFIG.NETSUITE_STORAGE_URL}/${encodeURIComponent(String(url))}`
    : `${CONFIG.STORAGE_URL}/${encodeURIComponent(String(url))}`;
}
