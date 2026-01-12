import { cleanSpaces, disconnect } from "@/services/utils.js";

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
      const { access_token, refresh_token, token_type } = response_data;

      if (!access_token || !refresh_token) {
        return 500;
      }

      sessionStorage.setItem("access_token", access_token);
      sessionStorage.setItem("refresh_token", refresh_token);

      return 200;
    } else {
      return response.status;
    }
  } catch {
    return 500;
  }
}

export async function update_recovery_code(new_code) {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
  try {
    const url = `${import.meta.env.VITE_API_URL}/auth/recovery/modify`;

    const token = sessionStorage.getItem("access_token");
    const payload = {
      password: new_code,
    };

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return response.status;
  } catch {
    return 500;
  }
}

export async function update_admin(data) {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
  try {
    const url = `${import.meta.env.VITE_API_URL}/auth/account/update`;

    const token = sessionStorage.getItem("access_token");
    const payload = {
      username: data.username,
      password: data.password,
    };
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return response.status;
  } catch {
    return 500;
  }
}

export async function get_admin() {
  if (!(await check_access_token())) {
    if (!(await check_refresh_token())) {
      disconnect();
    }
    await refresh();

    if (!(await check_access_token())) {
      disconnect();
    }
  }
  try {
    const url = `${import.meta.env.VITE_API_URL}/auth/account`;

    const token = sessionStorage.getItem("access_token");

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      const responseData = await response.json();
      return { status: response.status, data: responseData };
    } else {
      return { status: response.status, data: null };
    }
  } catch {
    return 500;
  }
}

export async function refresh() {
  try {
    const token = sessionStorage.getItem("refresh_token");
    const url = `${import.meta.env.VITE_API_URL}/auth/refresh`;
    const payload = {
      refresh_token: token,
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

export async function check_access_token() {
  try {
    const token = sessionStorage.getItem("access_token");
    if (!token) return false;

    const url = `${import.meta.env.VITE_API_URL}/auth/check/token/access`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token }),
    });
    if (response.status !== 200) return false;

    const result = await response.json();
    return result.valid === true;
  } catch {
    return false;
  }
}
export async function check_refresh_token() {
  try {
    const token = sessionStorage.getItem("refresh_token");
    if (!token) {
      return false;
    }
    const url = `${import.meta.env.VITE_API_URL}/auth/check/token/refresh`;
    const payload = {
      token: token,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.status !== 200) return false;

    const result = await response.json();
    return result.valid === true;
  } catch {
    return false;
  }
}
