// IndexedDB Helper for Storing Multiple Video Files & URLs Permanently per Lesson
const DB_NAME = 'PhysicsLessonVideoMultiDB';
const STORE_NAME = 'LessonVideoList';
const DB_VERSION = 2;

export interface StoredLessonVideo {
  id: string; // unique video id
  lessonId: number;
  title: string;
  fileName: string;
  sizeFormatted: string;
  blob?: Blob;
  url?: string;
  type: string;
  timestamp: number;
}

function openVideoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lessonId', 'lessonId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getLessonVideos(lessonId: number): Promise<StoredLessonVideo[]> {
  try {
    const db = await openVideoDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('lessonId');
      const req = index.getAll(lessonId);

      req.onsuccess = () => {
        const results = (req.result as StoredLessonVideo[]) || [];
        // Sort descending by timestamp (newest first)
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Failed to get videos from IndexedDB:', err);
    return [];
  }
}

export async function addLessonVideoFromFile(
  lessonId: number,
  file: File
): Promise<StoredLessonVideo> {
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
  const id = `video_${lessonId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const record: StoredLessonVideo = {
    id,
    lessonId,
    title: cleanTitle,
    fileName: file.name,
    sizeFormatted: `${sizeMB} MB`,
    blob: file,
    type: file.type || 'video/mp4',
    timestamp: Date.now()
  };

  const db = await openVideoDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  return record;
}

export async function addLessonVideoFromUrl(
  lessonId: number,
  title: string,
  url: string
): Promise<StoredLessonVideo> {
  const cleanTitle = title.trim() || 'Video Trực Tuyến';
  const id = `video_url_${lessonId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const record: StoredLessonVideo = {
    id,
    lessonId,
    title: cleanTitle,
    fileName: url,
    sizeFormatted: 'Trực tuyến',
    url,
    type: 'video/url',
    timestamp: Date.now()
  };

  const db = await openVideoDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  return record;
}

export async function deleteLessonVideo(videoId: string): Promise<boolean> {
  try {
    const db = await openVideoDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(videoId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to delete video:', err);
    return false;
  }
}

export async function clearAllLessonVideos(lessonId: number): Promise<boolean> {
  try {
    const videos = await getLessonVideos(lessonId);
    const db = await openVideoDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      videos.forEach(v => store.delete(v.id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch (err) {
    console.error('Failed to clear all videos:', err);
    return false;
  }
}
