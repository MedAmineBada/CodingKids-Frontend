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

export async function login(data) {
  try {
    const url = `${import.meta.env.VITE_API_URL}/auth/login`;
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

    if (response.status === 200) {
      const response_data = await response.json();
      const { access_token, token_type } = response_data;

      if (!access_token) {
        return 500;
      }

      sessionStorage.setItem("access_token", access_token);

      return 200;
    } else {
      return response.status;
    }
  } catch {
    return 500;
  }
}
