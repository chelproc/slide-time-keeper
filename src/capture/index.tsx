import { useEffect, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import { sendMessage } from "../websocket";

const workerPromise = (async () => {
  const worker = await createWorker();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  return worker;
})();

export default function CapturePage() {
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [captureArea, setCaptureArea] = useState<{
    from: { x: number; y: number };
    to?: { x: number; y: number };
  } | null>(null);
  const [recognizedNumber, setRecognizedNumber] = useState(0);

  const start = async () => {
    const videoElement = videoElementRef.current;
    if (!videoElement) return;
    const stream = await navigator.mediaDevices
      .getDisplayMedia({
        video: { width: { ideal: 3840 }, height: { ideal: 2160 } },
        audio: false,
      })
      .catch(() => null);
    if (!stream) return;
    videoElement.srcObject = stream;
    videoElement.play();
  };

  useEffect(() => {
    if (!captureArea?.to) return;

    const videoElement = videoElementRef.current;
    if (!videoElement) return;

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    if (videoElement.videoWidth + videoElement.videoHeight <= 0) return;

    const { width: viewWidth, height: viewHeight } =
      videoElement.getBoundingClientRect();

    const videoScale = Math.min(
      viewWidth / videoWidth,
      viewHeight / videoHeight
    );
    const offsetX = (viewWidth / videoScale - videoWidth) / 2;
    const offsetY = (viewHeight / videoScale - videoHeight) / 2;
    const captureAreaX =
      Math.min(captureArea.from.x, captureArea.to.x) / videoScale - offsetX;
    const captureAreaY =
      Math.min(captureArea.from.y, captureArea.to.y) / videoScale - offsetY;
    const captureAreaWidth =
      Math.abs(captureArea.to.x - captureArea.from.x) / videoScale;
    const captureAreaHeight =
      Math.abs(captureArea.to.y - captureArea.from.y) / videoScale;

    let lastSentPage = 0;
    const timerId = setInterval(async () => {
      const worker = await workerPromise;
      const canvas = document.createElement("canvas");
      canvas.width = captureAreaWidth;
      canvas.height = captureAreaHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Not supported");
      context.drawImage(
        videoElement,
        captureAreaX,
        captureAreaY,
        captureAreaWidth,
        captureAreaHeight,
        0,
        0,
        captureAreaWidth,
        captureAreaHeight
      );
      worker.recognize(canvas).then((result) => {
        const page = parseInt(result.data.text.replaceAll(/[^0-9]/g, ""), 10);
        if (page && page !== lastSentPage) {
          sendMessage(page.toString());
          lastSentPage = page;
          setRecognizedNumber(page);
        }
      });
    }, 500);

    return () => {
      clearInterval(timerId);
    };
  }, [captureArea]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        style={{ width: "100%", height: "100%", backgroundColor: "black" }}
        muted
        ref={videoElementRef}
        onClick={(e) => {
          const position = {
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          };
          if (!captureArea) {
            setCaptureArea({ from: position });
          } else if (!captureArea.to) {
            setCaptureArea({ ...captureArea, to: position });
          } else {
            setCaptureArea(null);
          }
        }}
      />
      {captureArea && captureArea.to && (
        <div
          style={{
            position: "absolute",
            top: Math.min(captureArea.from.y, captureArea.to.y),
            left: Math.min(captureArea.from.x, captureArea.to.x),
            width: Math.abs(captureArea.to.x - captureArea.from.x),
            height: Math.abs(captureArea.to.y - captureArea.from.y),
            border: "1px solid red",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          backgroundColor: "white",
          padding: "5px 10px",
          gap: "10px",
        }}
      >
        <button type="button" onClick={start}>
          Start
        </button>
        {recognizedNumber > 0 && <div>{recognizedNumber}</div>}
      </div>
    </div>
  );
}
