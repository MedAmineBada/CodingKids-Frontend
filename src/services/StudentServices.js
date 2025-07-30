export async function deleteStudent(id) {
  return (
    await fetch(`${import.meta.env.VITE_API_URL}/students/${id}/delete`, {
      method: "DELETE",
    })
  ).status;
}
