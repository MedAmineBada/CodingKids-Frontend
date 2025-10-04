import { removeAllSpaces } from "@/services/utils.js";

export async function getAllTeachers(order = "", search = "") {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/teachers/?order_by=${order}&search=${search}`,
    );
    if (response.status === 200) {
      const responseData = await response.json();

      return { status: response.status, teachers: responseData };
    } else {
      return { status: response.status, teachers: null };
    }
  } catch {
    return { status: 500, students: null };
  }
}

export async function updateTeacher(id, data) {
  const url = `${import.meta.env.VITE_API_URL}/teachers/update/${id}`;

  const payload = {
    name: data.name,
    cin: data.cin,
    tel: data.tel,
    email: removeAllSpaces(data.email) === "" ? null : data.email,
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response.status;
}

export async function addTeacher(data) {
  const url = `${import.meta.env.VITE_API_URL}/teachers/add`;

  const payload = {
    name: data.name,
    cin: data.cin,
    tel: data.tel,
    email: removeAllSpaces(data.email) === "" ? null : data.email,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  data = await response.json();

  return { status: response.status, id: data.id };
}

export async function deleteTeacher(id) {
  return (
    await fetch(`${import.meta.env.VITE_API_URL}/teachers/delete/${id}`, {
      method: "DELETE",
    })
  ).status;
}

export async function getCV(id) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/teachers/${id}/cv`,
    );
    const status = response.status;

    if (status === 200) {
      const blob = await response.blob();

      if (blob.type === "application/pdf") {
        return { status: response.status, data: blob };
      } else {
        return { status: response.status, data: null };
      }
    } else {
      return { status: response.status, data: null };
    }
  } catch {
    return { status: 500, data: null };
  }
}

export async function addCV(id, file) {
  try {
    const uploadUrl = `${import.meta.env.VITE_API_URL}/teachers/${id}/cv/upload`;
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    return response.status;
  } catch {
    return 500;
  }
}
