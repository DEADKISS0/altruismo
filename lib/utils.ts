import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodeHtmlToDataUrl(html: string): string {
  if (typeof window !== "undefined") {
    const bytes = new TextEncoder().encode(html);
    const binString = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
    return `data:text/html;base64,${window.btoa(binString)}`;
  }
  return `data:text/html;base64,${Buffer.from(html, "utf-8").toString("base64")}`;
}
