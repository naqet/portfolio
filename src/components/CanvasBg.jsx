import { initCanvas, clearEventListeners } from "../scripts/renderCanvas";
import { useEffect } from "react";

const CanvasBg = () => {
  useEffect(() => {
    initCanvas();
    return () => clearEventListeners();
  }, []);

  return (
    <canvas
      id="canvas-bg"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        width: "100vw",
        height: "100vh",
      }}
    />
  );
};

export default CanvasBg;
