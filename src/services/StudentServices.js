import { removeAllSpaces } from "@/services/utils.js";

export async function deleteStudent(id) {
  return (
    await fetch(`${import.meta.env.VITE_API_URL}/students/${id}/delete`, {
      method: "DELETE",
    })
  ).status;
}

export async function updateStudent(id, data) {
  const url = `${import.meta.env.VITE_API_URL}/students/${id}/update`;

  const payload = {
    name: data.name,
    birth_date: data.birth_date,
    tel1: data.tel1,
    tel2: data.tel2,
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

export async function addStudent(data) {
  const url = `${import.meta.env.VITE_API_URL}/students/add`;

  const payload = {
    name: data.name,
    birth_date: data.birth_date,
    tel1: data.tel1,
    tel2: data.tel2,
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
