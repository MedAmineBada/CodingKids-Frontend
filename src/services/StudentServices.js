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
