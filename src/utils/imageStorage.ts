// IndexedDB Helper for Storing Large High-Resolution Educational Images
const DB_NAME = 'PhysicsEducationDB';
const STORE_NAME = 'ScientistPortraits';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePortraitToDB(key: string, dataUrl: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrl, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to save portrait to IndexedDB:', err);
    // Fallback to localStorage if possible
    try {
      localStorage.setItem(`custom_portrait_${key}`, dataUrl);
      return true;
    } catch {
      return false;
    }
  }
}

export async function loadPortraitFromDB(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          // Fallback to localStorage
          try {
            const fallback = localStorage.getItem(`custom_portrait_${key}`);
            resolve(fallback);
          } catch {
            resolve(null);
          }
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      return localStorage.getItem(`custom_portrait_${key}`);
    } catch {
      return null;
    }
  }
}

export async function deletePortraitFromDB(key: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Failed to delete portrait from IndexedDB:', err);
    try {
      localStorage.removeItem(`custom_portrait_${key}`);
      return true;
    } catch {
      return false;
    }
  }
}

export async function loadAllPortraitsFromDB(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const key of keys) {
    try {
      const val = await loadPortraitFromDB(key);
      if (val) {
        result[key] = val;
      }
    } catch (e) {
      console.warn(`Error loading portrait ${key}:`, e);
    }
  }
  return result;
}

export function compressImage(file: File, maxDim: number = 1920): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
