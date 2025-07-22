import { useEffect, useState } from "react";

function ScanPage() {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("scannedImage");
    if (storedImage) {
      setImageData(storedImage);
    }
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Scan Result</h2>
      {imageData ? (
        <img
          src={imageData}
          alt="Scanned"
          style={{ maxWidth: "100%", height: "auto", border: "1px solid #ccc" }}
        />
      ) : (
        <p>No image scanned yet.</p>
      )}
    </div>
  );
}

export default ScanPage;
