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
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/formations/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        formation_type: data.type_id,
        start_date: data.start_date,
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
