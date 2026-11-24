"use client";

export function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const encoded = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(encoded)) {
      return decodeURIComponent(trimmed.slice(encoded.length));
    }
  }
  return "";
}

export async function ensureCsrfToken(): Promise<string> {
  const existing = readCookie("bha_csrf");
  if (existing) return existing;

  try {
    const res = await fetch("/api/auth/csrf", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.ok) {
      const json = (await res.json()) as { csrfToken?: string };
      if (json.csrfToken) return json.csrfToken;
    }
  } catch {
    // Ignore transient fetch failure; server will return clear CSRF message if absent
  }

  return readCookie("bha_csrf");
}

export async function authFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await ensureCsrfToken();
    if (token) {
      headers.set("x-csrf-token", token);
    }
  }

  return fetch(input, {
    ...init,
    method,
    headers,
    credentials: "same-origin",
  });
}
