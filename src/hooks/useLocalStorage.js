import { useState, useEffect } from 'react';

/**
 * Persist and restore a value from localStorage.
 * @param {string} key - localStorage key
 * @param {*} defaultValue - default value if nothing is stored
 */
export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn('localStorage write failed:', err);
    }
  }, [key, value]);

  return [value, setValue];
};

// ─── Recent Books ─────────────────────────────────────────────────────────────

const RECENT_BOOKS_KEY = 'bookreader_recent';
const MAX_RECENT = 5;

export const useRecentBooks = () => {
  const [recent, setRecent] = useLocalStorage(RECENT_BOOKS_KEY, []);

  const addBook = (fileName, page = 1, scale = 1.2) => {
    setRecent((prev) => {
      const filtered = prev.filter((b) => b.fileName !== fileName);
      const entry = {
        fileName,
        page,
        scale,
        lastOpened: Date.now(),
      };
      return [entry, ...filtered].slice(0, MAX_RECENT);
    });
  };

  const updateProgress = (fileName, page, scale) => {
    setRecent((prev) =>
      prev.map((b) => (b.fileName === fileName ? { ...b, page, scale, lastOpened: Date.now() } : b))
    );
  };

  const getBook = (fileName) => recent.find((b) => b.fileName === fileName) || null;

  return { recent, addBook, updateProgress, getBook };
};

// ─── Reading Session Autosave ─────────────────────────────────────────────────

export const useReadingSession = (fileName) => {
  const key = fileName ? `bookreader_session_${fileName}` : null;

  const save = (data) => {
    if (!key) return;
    try {
      localStorage.setItem(key, JSON.stringify({ ...data, savedAt: Date.now() }));
    } catch {}
  };

  const load = () => {
    if (!key) return null;
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  return { save, load };
};
