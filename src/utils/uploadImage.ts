export async function uploadGroupImage(_uid: string, _groupId: string, dataUrl: string): Promise<string> {
  return compressToBase64(dataUrl, 400, 0.7);
}

export async function deleteGroupImage(_uid: string, _groupId: string): Promise<void> {
  // images stored in Firestore — deletion handled by removing the field
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
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
