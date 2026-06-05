import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

// Upload a base64/dataURL image to Firebase Storage and return the download URL.
// Path: users/{uid}/groups/{groupId}.jpg
export async function uploadGroupImage(uid: string, groupId: string, dataUrl: string): Promise<string> {
  const storageRef = ref(storage, `users/${uid}/groups/${groupId}.jpg`);
  await uploadString(storageRef, dataUrl, 'data_url');
  return getDownloadURL(storageRef);
}

export async function deleteGroupImage(uid: string, groupId: string): Promise<void> {
  try {
    const storageRef = ref(storage, `users/${uid}/groups/${groupId}.jpg`);
    await deleteObject(storageRef);
  } catch {
    // ignore — file may not exist
  }
}
