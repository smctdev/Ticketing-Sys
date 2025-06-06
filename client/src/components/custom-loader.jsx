import React from "react";
import smctLogo from "/img/smct-logo.png"; // Import the image

const CustomLoadingIndicator = () => {
  return (
    <div className="loading-container">
      <iframe
        src="https://smctdevt.github.io/smctloder/"
        frameBorder="0"
        allowFullScreen
        style={{ width: "100%", height: "100%" }}
      ></iframe>
    </div>
  );
};

export { CustomLoadingIndicator };
