import { useState, useRef, useEffect } from "react"
import axios from "axios"
import Header from "../components/Header"
import Footer from "../components/Footer"
import InspectionResultCard from "../components/InspectionResultCard"
import { killAllCameraStreams } from "../utils/camera"

export default function UploadInspect() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    // Forcefully stop any camera streams when arriving at Upload page
    killAllCameraStreams()
  }, [])

  const handleFileChange = (file) => {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WEBP, etc.)")
      return
    }
    setError(null)
    setResult(null)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const analyzeImage = async () => {
    if (!selectedFile) return
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      setResult({
        predictedClass: response.data.predicted_class,
        confidence: response.data.confidence,
        explanation: response.data.explanation,
        heatmapImage: `data:image/jpeg;base64,${response.data.heatmap_image}`
      })
    } catch (err) {
      console.error(err)
      setError("Failed to connect to inspection server. Ensure backend is running via 'python run_pipeline.py --stage serve'.")
    } finally {
      setLoading(false)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // Load sample image from public folder
  const loadSample = async (samplePath, sampleName) => {
    try {
      setLoading(true)
      const res = await fetch(samplePath)
      const blob = await res.blob()
      const file = new File([blob], sampleName, { type: "image/png" })
      handleFileChange(file)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1e293b]">
      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-8 py-12 max-w-5xl">
        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f1ede6] border border-[#e8e3da] text-[#936639] text-xs font-semibold mb-3">
            <span>High-Resolution File Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0f172a]">
            Upload Timber Image &amp; Detect Defects
          </h1>
          <p className="mt-2 text-[#475569] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Select an image from your PC. The ResNet-18 model will classify any anomaly and spotlight the defective region using Grad-CAM.
          </p>

          {/* Quick Dataset Samples Row */}
          {!previewUrl && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
              <span className="text-[#64748b] mr-1">Or test with dataset specimens:</span>
              <button
                onClick={() => loadSample("/images/scratch.png", "sample_scratch.png")}
                className="px-3 py-1 rounded-lg bg-white hover:bg-[#f1ede6] text-[#92400e] border border-[#fde68a] shadow-xs cursor-pointer transition-colors"
              >
                Scratch
              </button>
              <button
                onClick={() => loadSample("/images/hole.png", "sample_hole.png")}
                className="px-3 py-1 rounded-lg bg-white hover:bg-[#f1ede6] text-[#991b1b] border border-[#fecaca] shadow-xs cursor-pointer transition-colors"
              >
                Hole
              </button>
              <button
                onClick={() => loadSample("/images/liquid.png", "sample_liquid.png")}
                className="px-3 py-1 rounded-lg bg-white hover:bg-[#f1ede6] text-[#0369a1] border border-[#bae6fd] shadow-xs cursor-pointer transition-colors"
              >
                Liquid
              </button>
              <button
                onClick={() => loadSample("/images/good.png", "sample_good.png")}
                className="px-3 py-1 rounded-lg bg-white hover:bg-[#f1ede6] text-[#1b4332] border border-[#c8e6c9] shadow-xs cursor-pointer transition-colors"
              >
                Good (Normal)
              </button>
            </div>
          )}
        </div>

        {/* Upload Drop Zone */}
        {!previewUrl && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center cursor-pointer transition-all duration-200 bg-white ${dragActive
                ? "border-[#1b4332] bg-[#f7faf8] scale-[1.01]"
                : "border-[#e8e3da] hover:border-[#936639]/60 shadow-xs"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0])}
            />



            <h3 className="text-xl font-bold text-[#0f172a] mb-1">
              Click to browse or drag &amp; drop an image
            </h3>
            <p className="text-sm text-[#64748b]">
              Supports high-resolution JPEG, PNG, WEBP from your PC
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-[#991b1b] text-sm flex items-center justify-between font-medium">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-[#991b1b] font-bold ml-4 cursor-pointer">✕</button>
          </div>
        )}

        {/* Preview & Action Controls */}
        {previewUrl && (
          <div className="space-y-8">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e8e3da] shadow-xs">
              <div className="flex items-center gap-3 truncate">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1b4332]"></div>
                <span className="text-sm text-[#1e293b] font-medium truncate max-w-xs sm:max-w-md font-mono">
                  {selectedFile?.name}
                </span>
                <span className="text-xs text-[#94a3b8] font-mono">
                  ({(selectedFile?.size / 1024).toFixed(1)} KB)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={resetUpload}
                  className="px-4 py-2 text-sm font-medium text-[#475569] hover:text-[#0f172a] bg-[#faf8f5] hover:bg-[#f1ede6] border border-[#e8e3da] rounded-xl transition-colors cursor-pointer"
                >
                  Choose Different Image
                </button>
                <button
                  onClick={analyzeImage}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing Surface...</span>
                    </>
                  ) : (
                    <span>Analyze Defect</span>
                  )}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <InspectionResultCard
              originalImage={previewUrl}
              originalLabel="Uploaded Image (from PC)"
              heatmapImage={result?.heatmapImage}
              predictedClass={result?.predictedClass}
              confidence={result?.confidence}
              explanation={result?.explanation}
              loading={loading}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
