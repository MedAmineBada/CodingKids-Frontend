import React, { useState } from "react";

function CameraCapture() {
  const [image, setImage] = useState(null);

  const handleCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setImage(imageURL);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Take a Photo</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        style={{ marginBottom: "20px" }}
      />

      {image && (
        <div>
          <h4>Preview:</h4>
          <img
            src={image}
            alt="Captured"
            style={{ width: "100%", maxWidth: "400px" }}
          />
        </div>
      )}
    </div>
  );
}

export default CameraCapture;
