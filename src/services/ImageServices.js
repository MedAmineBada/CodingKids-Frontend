export const getImage = async (id) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/students/${id}/image`,
    );

    if (!response.ok) {
      return { status: response.status, blob: null };
    }

    const blob = await response.blob();

    return { status: response.status, blob };
  } catch {
    return { status: 500, blob: null };
  }
};
