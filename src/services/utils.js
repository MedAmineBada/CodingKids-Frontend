import jsPDF from "jspdf";

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

export async function verifyStr(string) {
  return removeAllSpaces(string) !== "" && /^[A-Za-z\s]+$/.test(string);
}

export async function verifyTel(string) {
  return (
    removeAllSpaces(string) !== "" &&
    /^[0-9]+$/.test(string) &&
    string.length === 8
  );
}

export async function verifyMail(string) {
  if (removeAllSpaces(string) === "") {
    return true;
  }
  return (
    removeAllSpaces(string) !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(string)
  );
}

export async function verifyDOB(dateString) {
  if (removeAllSpaces(dateString) === "") return false;
  const date = new Date(dateString);
  const now = new Date();
  return !isNaN(date.getTime()) && date <= now;
}

export function saveQRToPDF(src) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [390, 390],
  });
  doc.addImage(src, "WEBP", 0, 0, 390, 390);

  doc.save("QREtudiant.pdf");
}

export function formatDateToYYYYMMDD(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null; // Handle invalid date
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ItemInArray(item, array) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === item) return true;
  }
  return false;
}
