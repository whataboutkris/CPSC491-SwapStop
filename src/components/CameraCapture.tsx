import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

type CameraCaptureProps = {
  onCapture: (file: File) => void;
};

const videoConstraints = {
  facingMode: { ideal: "environment" }, // prefers back camera if available
};

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const handleStartCamera = () => {
    setIsCameraOn(true);
  };

  const handleStopCamera = () => {
    setIsCameraOn(false);
    stopStream();
  };

  const handleCapture = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const file = dataURLtoFile(imageSrc, `camera_${Date.now()}.jpg`);
    onCapture(file);
  };

  // Stop camera when component unmounts or camera turns off
  const stopStream = () => {
    const videoElement = webcamRef.current?.video as HTMLVideoElement | undefined;
    const stream = videoElement?.srcObject as MediaStream | null | undefined;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopStream();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {!isCameraOn && (
        <button
          type="button"
          onClick={handleStartCamera}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-mediumh hover:bg-indigo-700"
        >
          Start Camera
        </button>
      )}

      {isCameraOn && (
        <>
          <div className="w-full max-w-sm border rounded-xl overflow-hidden bg-black">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-auto"
              onUserMedia={() => console.log("✅ Webcam started")}
              onUserMediaError={(err) => console.error("❌ Webcam error", err)}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCapture}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-600"
            >
              Capture Photo
            </button>

            <button
              type="button"
              onClick={handleStopCamera}
              className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400"
            >
              Stop Camera
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// convert photo for file upload
function dataURLtoFile(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], fileName, { type: mime });
}
