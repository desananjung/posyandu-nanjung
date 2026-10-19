import { openDB } from 'idb';

export const initDB = async () => {
  return openDB('PosyanduDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pending_kegiatan')) {
        db.createObjectStore('pending_kegiatan', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const simpanOffline = async (data) => {
  const db = await initDB();
  return db.add('pending_kegiatan', data);
};

export const ambilSemuaOffline = async () => {
  const db = await initDB();
  return db.getAll('pending_kegiatan');
};

export const hapusOffline = async (id) => {
  const db = await initDB();
  return db.delete('pending_kegiatan', id);
};