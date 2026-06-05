import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadGroupImage(uid: string, groupId: string, dataUrl: string): Promise<string> {
  try {
    const storageRef = ref(storage, `users/${uid}/groups/${groupId}.jpg`);
    await uploadString(storageRef, dataUrl, 'data_url');
    return getDownloadURL(storageRef);
  } catch (err) {
    console.warn('[Storage] upload failed, falling back to base64:', err);
    return compressToBase64(dataUrl, 400, 0.6);
  }
}

export async function deleteGroupImage(uid: string, groupId: string): Promise<void> {
  try {
    const storageRef = ref(storage, `users/${uid}/groups/${groupId}.jpg`);
    await deleteObject(storageRef);
  } catch {
    // ignore — file may not exist in Storage
  }
}

function compressToBase64(dataUrl: string, maxPx: number, quality: number): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // last resort: return original
    img.src = dataUrl;
  });
}
