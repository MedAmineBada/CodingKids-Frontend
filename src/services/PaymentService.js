export async function getPaymentStatus(student_id) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/payments/status/${student_id}`,
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
  const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
