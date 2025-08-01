export async function saveToIndexedDB<T>(key: string, data: T) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("e2ee-db", 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore("keys");
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readwrite");
      tx.objectStore("keys").put(data, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getFromIndexedDB<T>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("e2ee-db", 1);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("keys", "readonly");
      const getRequest = tx.objectStore("keys").get(key);
      getRequest.onsuccess = () => resolve(getRequest.result ?? null);
      getRequest.onerror = () => reject(getRequest.error);
    };
    request.onerror = () => reject(request.error);
  });
}
