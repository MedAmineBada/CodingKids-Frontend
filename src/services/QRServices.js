import {
  check_access_token,
  check_refresh_token,
  refresh,
} from "@/services/AuthServices.js";
import { disconnect } from "@/services/utils.js";

export async function scanStudent(file) {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
  const token = sessionStorage.getItem("access_token");

  const formData = new FormData();
  formData.append("qr", file);
  const uploadUrl = import.meta.env.VITE_API_URL + "/scan";

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (response.status === 200) {
    const data = await response.json();
    localStorage.setItem("scanResult", JSON.stringify(data));
    return { status: 200, msg: "", showError: false };
  } else {
    const status = response.status;
    let msg = "Une erreur est survenue. Veuillez réessayer plus tard.";

    if (status === 400) {
      msg =
        "Le fichier téléchargé n’est pas une image prise en charge. Veuillez envoyer un fichier image (JPEG, PNG, …).";
    } else if (status === 404) {
      msg =
        "Aucun étudiant n’est associé à ce code QR. Vérifiez que vous scannez le bon code.";
    } else if (status === 500) {
      msg =
        "Le code QR est manquant ou illisible. Assurez-vous que l’image est nette et que le QR code est entièrement visible.";
    }

    return { status: status, msg: msg, showError: true };
  }
}

export async function getQR(id) {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
  const token = sessionStorage.getItem("access_token");

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/students/${id}/code`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      return { status: response.status, blob: null };
    }

    const blob = await response.blob();

    return { status: response.status, blob };
  } catch {
    return { status: 500, blob: null };
  }
}
