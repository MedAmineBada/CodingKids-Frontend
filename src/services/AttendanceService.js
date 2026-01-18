import {
  check_access_token,
  check_refresh_token,
  refresh,
} from "@/services/AuthServices.js";
import { disconnect } from "@/services/utils.js";

export async function getAttendances(id) {
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

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/attendances/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, dates: responseData };
  } else {
    return { status: response.status, dates: null };
  }
}

export async function addAttendance(id, date) {
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

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/attendances/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ student_id: id, attend_date: date }),
    },
  );

  if (response.status === 201) {
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } else {
    return { status: response.status, data: null };
  }
}

export async function deleteAttendance(id, date) {
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
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/attendances/delete`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ student_id: id, attend_date: date }),
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } else {
    return { status: response.status, data: null };
  }
}

export async function getSessions(id) {
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

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/teachers/${id}/sessions`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, dates: responseData };
  } else {
    return { status: response.status, dates: null };
  }
}

export async function addSession(id, date) {
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

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/teachers/sessions/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teacher_id: id, session_date: date }),
    },
  );

  if (response.status === 201) {
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } else {
    return { status: response.status, data: null };
  }
}

export async function removeSession(id, date) {
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

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/teachers/sessions/delete`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teacher_id: id, session_date: date }),
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } else {
    return { status: response.status, data: null };
  }
}
