import styles from "./ProfileImage.module.css";
import { useEffect, useState } from "react";
import { CircularLoading } from "respinner";
import { getImage } from "@/services/ImageServices.js";
import ImageModal from "@/components/modals/ImageModal/ImageModal.jsx";

function StudentImage({ id, shadow, cursor }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showImage, setShowImage] = useState(false);

  function handleImageClick() {
    setShowImage(true);
  }

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
  function changeImage(img) {
    const blobUrl = URL.createObjectURL(img);
    setImageUrl(blobUrl);
  }
  return (
    <div className={styles.wrapper} style={boxShadowStyle}>
      <ImageModal
        cursor={"pointer"}
        show={showImage}
        onClose={() => setShowImage(false)}
        url={imageUrl}
        func={changeImage}
      ></ImageModal>

      {loading ? (
        <CircularLoading size="60%" stroke="white" strokeWidth={7} />
      ) : (
        <img
          src={error ? "/NoImage.svg" : imageUrl}
          alt="Student"
          className={styles.image}
          onClick={handleImageClick}
        />
      )}
    </div>
  );
}

export default StudentImage;
