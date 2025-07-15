// src/components/EyeToggle.jsx
import React, { useState } from "react";

export default function EyeToggle({ className = "", onChange }) {
  const [visible, setVisible] = useState(false);

  const flip = () => {
    const next = !visible;
    setVisible(next);
    if (onChange) onChange(next);
  };

  return (
    <span
      onClick={flip}
      className={className}
      style={{ cursor: "pointer", userSelect: "none" }}
    >
      {visible ? (
        /* eye-off */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 12 12"
        >
          <path
            fill="currentColor"
            d="M3.82 9.595C4.47 9.844 5.197 10 6 10c3.1 0 5.08-2.33 5.79-3.34c.28-.39.28-.93 0-1.32a9 9 0 0 0-1.81-1.906L8.328 5.086a2.5 2.5 0 0 1-3.241 3.241zm2.097-2.097L6 7.5a1.5 1.5 0 0 0 1.498-1.583l-1.582 1.58Zm.166-2.996l-1.58 1.582a1.5 1.5 0 0 1 1.581-1.581Zm.831-.83a2.5 2.5 0 0 0-3.241 3.241L2.02 8.567A9 9 0 0 1 .21 6.66c-.28-.39-.28-.92 0-1.32C.92 4.33 2.9 2 6 2c.803 0 1.53.156 2.18.405zm-.997 3.826L6 7.5a1.5 1.5 0 0 0 1.498-1.583l-1.582 1.58Zm.166-2.996a1.5 1.5 0 0 0-1.581 1.581l1.582-1.58Zm4.784-2.726a.455.455 0 0 0-.58-.695l-.063.052l-9.09 9.091a.455.455 0 0 0 .579.695l.063-.052l9.09-9.091Z"
          />
        </svg>
      ) : (
        /* eye */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1em"
          height="1em"
          viewBox="0 0 12 12"
        >
          <g fill="currentColor">
            <circle cx="6" cy="6" r="1.5" />
            <path d="M11.79 5.34C11.08 4.33 9.1 2 6 2S.92 4.33.21 5.34c-.28.4-.28.93 0 1.32C.92 7.67 2.9 10 6 10s5.08-2.33 5.79-3.34c.28-.39.28-.93 0-1.32M6 8.5a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5" />
          </g>
        </svg>
      )}
    </span>
  );
}
