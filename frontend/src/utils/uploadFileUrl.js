import { getDefaultApiUrl } from "../services/api";

export function getFileUrl(url) {
    if (!url) return "";

    // Data URLs (e.g. base64 image strings from camera / file reader)
    if (url.startsWith("data:")) {
        return url;
    }

    // Absolute URLs or blobs
    if (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("blob:")
    ) {
        return url;
    }

    // Resolve base backend URL from API instance / localStorage / env
    let apiUrl = "";
    try {
        apiUrl = getDefaultApiUrl();
    } catch {
        apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    }

    const backendUrl = (apiUrl || "http://localhost:4000/api").replace(/\/api\/?$/, "");
    const cleanUrl = url.startsWith("/") ? url : `/${url}`;
    return `${backendUrl}${cleanUrl}`;
}