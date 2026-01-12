import {
  check_access_token,
  check_refresh_token,
  refresh,
} from "@/services/AuthServices.js";
import { disconnect } from "@/services/utils.js";

export async function getPaymentStatus(student_id) {
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
    `${import.meta.env.VITE_API_URL}/payments/status/${student_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (response.status === 200) {
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } else {
    return { status: response.status, data: null };
  }
}

export async function addPayment(
  student_id,
  month,
  year,
  payment_date,
  amount,
) {
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

  const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      student_id: student_id,
      month: month,
      year: year,
      payment_date: payment_date,
      amount: amount,
    }),
  });

  if (response.status === 201) {
    const responseData = await response.json();
    return { status: response.status, data: responseData };
  } else {
    return { status: response.status, data: null };
  }
}

export async function editPayment(
  student_id,
  month,
  year,
  payment_date,
  amount,
) {
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
  const url = `${import.meta.env.VITE_API_URL}/payments/edit`;
  const payload = {
    student_id: student_id,
    month: month,
    year: year,
    payment_date: payment_date,
    amount: amount,
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

export async function deletePayment(
  student_id,
  month,
  year,
  payment_date,
  amount,
) {
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
    `${import.meta.env.VITE_API_URL}/payments/delete`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        student_id: student_id,
        month: month,
        year: year,
        payment_date: payment_date,
        amount: amount,
      }),
    },
  );

  return response.status;
}
