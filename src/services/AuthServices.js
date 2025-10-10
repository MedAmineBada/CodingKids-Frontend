import { cleanSpaces } from "@/services/utils.js";

export async function check_admins() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/check`);
    return response.status;
  } catch {
    return 500;
  }
}

export async function add_admin(data) {
  try {
    const url = `${import.meta.env.VITE_API_URL}/auth/first_login`;
    const payload = {
      username: cleanSpaces(data.username),
      password: data.password,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.status;
  } catch {
    return 500;
  }
}
