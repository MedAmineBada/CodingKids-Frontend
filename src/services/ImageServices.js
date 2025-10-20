import {
  check_access_token,
  check_refresh_token,
  refresh,
} from "@/services/AuthServices.js";
import { disconnect } from "@/services/utils.js";

export const getImage = async (id) => {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
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
      `${import.meta.env.VITE_API_URL}/students/${id}/image`,
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
};

export async function uploadImage(id, file) {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
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
  formData.append("image", file);

  const uploadUrl = `${import.meta.env.VITE_API_URL}/students/${id}/image/replace`;

  const response = await fetch(uploadUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response.status;
}

export async function deleteImage(id) {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
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
    const url = `${import.meta.env.VITE_API_URL}/students/${id}/image/delete`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.status;
  } catch {
    return 500;
  }
}
