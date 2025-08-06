import styles from "./ProfileImage.module.css";
import { useEffect, useState } from "react";
import { CircularLoading } from "respinner";
import { getImage } from "@/services/ImageServices.js";

function StudentImage({ id, shadow, onClickFunction, cursor }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const boxShadowStyle =
    typeof shadow === "number"
      ? { boxShadow: `0 0 ${shadow}px #333333`, cursor: cursor }
      : { cursor: cursor };

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(false);

        const { status, blob } = await getImage(id);

        if (!isMounted) return;

        if (status === 200) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
          localStorage.setItem("imageUrl", objectUrl);
        } else if (status === 404) {
          setError(true);
          localStorage.setItem("imageUrl", null);
        } else {
          setError(true);
        }
      } catch {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
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
          onClick={onClickFunction}
        />
      )}
    </div>
  );
}

export default StudentImage;
