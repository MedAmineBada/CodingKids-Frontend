export async function getFormations() {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(`${import.meta.env.VITE_API_URL}/formations/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, formations: responseData };
  } else {
    return { status: response.status, formations: null };
  }
}

export async function getTypes() {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/formations/types`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, types: responseData };
  } else {
    return { status: response.status, types: null };
  }
}

export async function addType(label) {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/formations/types/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ label: label }),
    },
  );

  if (response.status === 201) {
    const responseData = await response.json();
    return { status: response.status, id: responseData };
  } else {
    return { status: response.status, id: null };
  }
}

export async function addFormation(data) {
  // Accepts either { formation_type, start_date, teacher_id } OR { type_id, start_date, teacher_id }
  const token = sessionStorage.getItem("access_token");

  // prefer explicit formation_type, otherwise fallback to type_id
  const formationType = data.formation_type ?? data.type_id ?? null;

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/formations/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        formation_type: formationType,
        start_date: data.start_date,
        teacher_id: data.teacher_id ?? null,
      }),
    },
  );

  if (response.status === 201) {
    const responseData = await response.json();
    return { status: response.status, id: responseData };
  } else {
    return { status: response.status, id: null };
  }
}

export async function editFormation(id, data) {
  // Accepts either { formation_type, start_date, teacher_id } OR { type_id, start_date, teacher_id }
  try {
    const token = sessionStorage.getItem("access_token");
    const formationType = data.formation_type ?? data.type_id ?? null;

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/formations/update/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formation_type: formationType,
          start_date: data.start_date,
          teacher_id: data.teacher_id ?? null,
        }),
      },
    );

    const responseData = await response.json();
    return response.status;
  } catch {
    return 500;
  }
}

export async function deleteFormation(id) {
  try {
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/formations/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseData = await response.json();
    return response.status;
  } catch {
    return 500;
  }
}

export async function renameType(id, data) {
  try {
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/formations/types/rename/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: data.label,
        }),
      },
    );

    const responseData = await response.json();
    return response.status;
  } catch {
    return 500;
  }
}

export async function deleteType(id) {
  try {
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/formations/types/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const responseData = await response.json();
    return response.status;
  } catch {
    return 500;
  }
}

export async function getFormationsByTeacher(id) {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/teachers/${id}/formations`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, formations: responseData };
  } else {
    return { status: response.status, formations: null };
  }
}

export async function unassignFormation(tid, fid) {
  try {
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/formations/unassign/${tid}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          formation_id: fid,
        }),
      },
    );
    return response.status;
  } catch {
    return 500;
  }
}

export async function enroll(sid, fid) {
  try {
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/students/${sid}/enroll/${fid}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.status;
  } catch {
    return 500;
  }
}

export async function get_enrollments(sid) {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/students/${sid}/enrollments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, enrollments: responseData };
  } else {
    return { status: response.status, enrollments: null };
  }
}

export async function get_available_enrollments(sid) {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/students/${sid}/enrollments/available`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, av_enrollments: responseData };
  } else {
    return { status: response.status, av_enrollments: null };
  }
}

export async function remove_enrollment(sid, fid) {
  try {
    const token = sessionStorage.getItem("access_token");

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/students/${sid}/enrollments/${fid}/remove`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.status;
  } catch {
    return 500;
  }
}
