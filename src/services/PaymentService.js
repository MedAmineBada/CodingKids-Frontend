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
