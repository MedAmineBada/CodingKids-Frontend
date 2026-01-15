import { disconnect, removeAllSpaces } from "@/services/utils.js";
import {
  check_access_token,
  check_refresh_token,
  refresh,
} from "@/services/AuthServices.js";

export async function deleteStudent(id) {
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

  return (
    await fetch(`${import.meta.env.VITE_API_URL}/students/${id}/delete`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  ).status;
}

export async function updateStudent(id, data) {
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
  const url = `${import.meta.env.VITE_API_URL}/students/${id}/update`;

  const payload = {
    name: data.name,
    birth_date: data.birth_date,
    tel1: removeAllSpaces(data.tel1) === "" ? null : data.tel1,
    tel2: removeAllSpaces(data.tel2) === "" ? null : data.tel2,
    email: removeAllSpaces(data.email) === "" ? null : data.email,
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
}

export async function addStudent(data) {
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
  const url = `${import.meta.env.VITE_API_URL}/students/add`;

  const payload = {
    name: data.name,
    birth_date: data.birth_date,
    tel1: removeAllSpaces(data.tel1) === "" ? null : data.tel1,
    tel2: removeAllSpaces(data.tel2) === "" ? null : data.tel2,
    email: removeAllSpaces(data.email) === "" ? null : data.email,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  data = await response.json();

  return { status: response.status, id: data.id };
}

export async function getAllStudents(order = "", search = "") {
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
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/students/?order_by=${order}&name_search=${search}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 200) {
      const responseData = await response.json();
      return { status: response.status, students: responseData };
    } else {
      return { status: response.status, students: null };
    }
  } catch {
    return { status: 500, students: null };
  }
}
