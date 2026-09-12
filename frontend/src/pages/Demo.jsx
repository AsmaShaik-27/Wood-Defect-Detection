import { useRef, useState, useEffect } from "react"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import InspectionResultCard from "../components/InspectionResultCard"
import { killAllCameraStreams, setActiveStream } from "../utils/camera"

export default function Demo() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const [originalImage, setOriginalImage] = useState(null)
  const [heatmap, setHeatmap] = useState(null)
  const [prediction, setPrediction] = useState("")
  const [confidence, setConfidence] = useState("")
  const [explanation, setExplanation] = useState("")
  const [cameraOn, setCameraOn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const stopCamera = () => {
    killAllCameraStreams()
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraOn(false)
  }

  const startCamera = async (isMountedCheck) => {
    try {
      setError(null)
      killAllCameraStreams()

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 640 }, height: { ideal: 480 } } 
      })
      
      // If user navigated away while getUserMedia was resolving, immediately stop
      if (typeof isMountedCheck === "function" && !isMountedCheck()) {
        mediaStream.getTracks().forEach((track) => {
          track.enabled = false
          track.stop()
        })
        return
      }

      setActiveStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setCameraOn(true)
    } catch (err) {
      if (typeof isMountedCheck === "function" && !isMountedCheck()) return
      console.error("Camera error:", err)
      setError("Unable to access camera. Please allow camera permissions in your browser.")
      setCameraOn(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    startCamera(() => isMounted)

    return () => {
      isMounted = false
      stopCamera()
    }
  }, [])

  const capture = async () => {
    if (!videoRef.current || !canvasRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext("2d")

    canvas.width = 224
    canvas.height = 224

    context.drawImage(video, 0, 0, 224, 224)

    const imageData = canvas.toDataURL("image/jpeg")
    setOriginalImage(imageData)
    setLoading(true)
    setError(null)

    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData()
        formData.append("file", blob, "frame.jpg")

        const response = await axios.post(
          "http://127.0.0.1:8000/predict",
          formData
        )

        setPrediction(response.data.predicted_class)
        setConfidence(response.data.confidence)
        setHeatmap(`data:image/jpeg;base64,${response.data.heatmap_image}`)
        setExplanation(response.data.explanation || "Inspection completed.")
      } catch (err) {
        console.error(err)
        setError("Failed to connect to inspection server. Ensure backend is running at http://127.0.0.1:8000")
      } finally {
        setLoading(false)
      }
    }, "image/jpeg")
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1e293b]">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-12 max-w-5xl">
        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f5e9] border border-[#c8e6c9] text-[#1b4332] text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Optical Vision Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0f172a]">
            Live Camera Defect Inspection
          </h1>
          <p className="mt-2 text-[#475569] text-sm sm:text-base max-w-xl mx-auto">
            Point camera at the timber surface and click &ldquo;Capture &amp; Analyze&rdquo; to detect and localize anomalies in real time.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-[#991b1b] font-bold ml-4 cursor-pointer">✕</button>
          </div>
        )}

        {/* Camera Video Section */}
        <div className="bg-white border border-[#e8e3da] rounded-2xl p-6 mb-10 max-w-2xl mx-auto shadow-xs">
          <div className="relative rounded-xl overflow-hidden bg-[#f7f5f0] border border-[#e8e3da] flex items-center justify-center aspect-video mb-6 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!cameraOn ? "hidden" : ""}`}
            />

            {!cameraOn && (
              <div className="text-center p-8 text-[#94a3b8]">
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm font-medium text-[#64748b]">Camera is currently paused</p>
                <p className="text-xs text-[#94a3b8] mt-1">Click &ldquo;Turn On Camera&rdquo; to start streaming</p>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {cameraOn ? (
              <button
                onClick={stopCamera}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-[#f1ede6] text-[#475569] border border-[#e8e3da] shadow-xs transition-all cursor-pointer"
              >
                Turn Off Camera
              </button>
            ) : (
              <button
                onClick={() => startCamera()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#e8f5e9] hover:bg-[#d8edd9] text-[#1b4332] border border-[#c8e6c9] shadow-xs transition-all cursor-pointer"
              >
                Turn On Camera
              </button>
            )}

            <button
              onClick={capture}
              disabled={!cameraOn || loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all cursor-pointer flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Surface...</span>
                </>
              ) : (
                <span>Capture &amp; Analyze</span>
              )}
            </button>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />

        {/* Results Section */}
        {originalImage && (
          <div className="mt-8">
            <InspectionResultCard
              originalImage={originalImage}
              originalLabel="Captured Frame (from Camera)"
              heatmapImage={heatmap}
              predictedClass={prediction}
              confidence={confidence}
              explanation={explanation}
              loading={loading}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}