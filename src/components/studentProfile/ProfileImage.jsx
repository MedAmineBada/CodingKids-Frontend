import styles from "./ProfileImage.module.css";
import { useEffect, useState } from "react";
import { CircularLoading } from "respinner";

function StudentImage({ id, shadow }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const boxShadowStyle =
    typeof shadow === "number" ? { boxShadow: `0 0 ${shadow}px #333333` } : {};
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    let objectUrlForCleanup = null;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/students/${id}/image`,
          { signal: abortController.signal },
        );

        if (!response.ok) {
          if (response.status === 404) {
            setError(true);
            return;
          }
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        objectUrlForCleanup = objectUrl;

        if (isMounted) {
          setImageUrl(objectUrl);
        }
      } catch (err) {
        if (err.name !== "AbortError" && isMounted) {
          console.error("Fetch error:", err);
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      abortController.abort();
      if (objectUrlForCleanup) {
        URL.revokeObjectURL(objectUrlForCleanup);
      }
    };
  }, [id]);

  return (
    <div className={styles.wrapper} style={boxShadowStyle}>
      {loading ? (
        <CircularLoading size="60%" stroke="white" strokeWidth={7} />
      ) : (
        <img
          src={error ? "/NoImage.svg" : imageUrl}
          alt="Student"
          className={styles.image}
        />
      )}
    </div>
  );
}

export default StudentImage;
