"use client";

import { useMemo, useSyncExternalStore } from "react";

export const SAVED_TRIPS_STORAGE_KEY = "bha_saved_trips";
export const SAVED_TRIPS_EVENT = "bha-saved-trips-change";

export const COMPARE_TRIPS_STORAGE_KEY = "bha_compare_trips";
export const COMPARE_TRIPS_EVENT = "bha-compare-trips-change";
export const MAX_COMPARE_TRIPS = 4;

function subscribeKey(eventName: string) {
  return (callback: () => void) => {
    window.addEventListener(eventName, callback);
    window.addEventListener("storage", callback);
    return () => {
      window.removeEventListener(eventName, callback);
      window.removeEventListener("storage", callback);
    };
  };
}

function getStorageSnapshot(storageKey: string): () => string {
  return () => {
    try {
      return window.localStorage.getItem(storageKey) ?? "[]";
    } catch {
      return "[]";
    }
  };
}

function getServerSnapshot(): string {
  return "[]";
}

function parseSlugList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function writeSlugList(storageKey: string, eventName: string, slugs: string[]) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(slugs));
    window.dispatchEvent(new Event(eventName));
  } catch {
    // Ignore storage failures in restricted browsing modes
  }
}

const subscribeSaved = subscribeKey(SAVED_TRIPS_EVENT);
const getSavedSnapshot = getStorageSnapshot(SAVED_TRIPS_STORAGE_KEY);

export function useSavedTripSlugs(): string[] {
  const raw = useSyncExternalStore(
    subscribeSaved,
    getSavedSnapshot,
    getServerSnapshot
  );
  return useMemo(() => parseSlugList(raw), [raw]);
}

export function toggleSavedTripSlug(slug: string): boolean {
  const current = parseSlugList(getSavedSnapshot());
  const exists = current.includes(slug);
  const next = exists
    ? current.filter((item) => item !== slug)
    : [...current, slug];
  writeSlugList(SAVED_TRIPS_STORAGE_KEY, SAVED_TRIPS_EVENT, next);
  return !exists;
}

const subscribeCompare = subscribeKey(COMPARE_TRIPS_EVENT);
const getCompareSnapshot = getStorageSnapshot(COMPARE_TRIPS_STORAGE_KEY);

export function useCompareTripSlugs(): string[] {
  const raw = useSyncExternalStore(
    subscribeCompare,
    getCompareSnapshot,
    getServerSnapshot
  );
  return useMemo(() => parseSlugList(raw).slice(0, MAX_COMPARE_TRIPS), [raw]);
}

export function addCompareTripSlug(slug: string): void {
  const current = parseSlugList(getCompareSnapshot());
  if (current.includes(slug)) return;
  const next = [...current, slug].slice(-MAX_COMPARE_TRIPS);
  writeSlugList(COMPARE_TRIPS_STORAGE_KEY, COMPARE_TRIPS_EVENT, next);
}

export function removeCompareTripSlug(slug: string): void {
  const current = parseSlugList(getCompareSnapshot());
  const next = current.filter((item) => item !== slug);
  writeSlugList(COMPARE_TRIPS_STORAGE_KEY, COMPARE_TRIPS_EVENT, next);
}

export function toggleCompareTripSlug(slug: string): void {
  const current = parseSlugList(getCompareSnapshot());
  if (current.includes(slug)) {
    writeSlugList(
      COMPARE_TRIPS_STORAGE_KEY,
      COMPARE_TRIPS_EVENT,
      current.filter((item) => item !== slug)
    );
    return;
  }
  const next = [...current, slug].slice(-MAX_COMPARE_TRIPS);
  writeSlugList(COMPARE_TRIPS_STORAGE_KEY, COMPARE_TRIPS_EVENT, next);
}

export function clearCompareTripSlugs(): void {
  writeSlugList(COMPARE_TRIPS_STORAGE_KEY, COMPARE_TRIPS_EVENT, []);
}
