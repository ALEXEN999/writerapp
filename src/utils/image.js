// --- UTILIDADES IMAGEN ---
export const compressImage = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
        resolve(dataUrl);
      }
    }
  })
};

export const getImageSizeKB = (dataURL) => {
  if (!dataURL) return 0;
  const base64String = dataURL.split(',')[1] || dataURL;
  const bytes = (base64String.length * 3) / 4;
  return (bytes / 1024).toFixed(1);
};