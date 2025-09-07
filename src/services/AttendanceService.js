export async function getAttendances(id) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/attendances/${id}`,
  );
  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, dates: responseData };
  } else {
    return { status: response.status, dates: null };
  }
}
export async function addAttendance(id, date) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/attendances/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/attendances/delete`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
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
