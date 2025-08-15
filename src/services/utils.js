export function cleanSpaces(text) {
  return text.trim().replace(/\s+/g, " ");
}

export function removeAllSpaces(text) {
  return text.replace(/\s+/g, "");
}

export function capitalizeWords(text) {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function clearStudentLocalStorage() {
  localStorage.removeItem("scanResult");
  localStorage.removeItem("imageUrl");
}

export async function getCroppedImg(imageSrc, crop) {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/webp",
      0.8,
    );
  });
}

export async function urlToFile(
  url,
  filename = "cropped.webp",
  mimeType = "image/webp",
) {
  if (url.startsWith("data:")) {
    const [meta, data] = url.split(",");
    const matches = meta.match(/data:(.*?);base64/);
    const mime = matches ? matches[1] : mimeType;
    const binary = atob(data);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new File([u8], filename, { type: mime });
  }

  const resp = await fetch(url);
  const blob = await resp.blob();
  return new File([blob], filename, { type: blob.type || mimeType });
}
