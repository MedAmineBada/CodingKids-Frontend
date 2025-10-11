export async function getAttendances(id) {
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
