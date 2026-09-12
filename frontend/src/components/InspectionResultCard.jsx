export default function InspectionResultCard({
  originalImage,
  originalLabel = "Input Image",
  heatmapImage,
  predictedClass,
  confidence,
  explanation,
  loading = false
}) {
  const getDefectTheme = (defect) => {
    switch (defect?.toLowerCase()) {
      case "good":
        return {
          badge: "bg-[#e8f5e9] text-[#1b4332] border-[#a5d6a7]",
          bar: "from-[#1b4332] to-[#52b788]",
          label: "Normal / Defect-Free"
        }
      case "scratch":
        return {
          badge: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
          bar: "from-[#936639] to-[#d97706]",
          label: "Surface Scratch Defect"
        }
      case "hole":
        return {
          badge: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
          bar: "from-[#b91c1c] to-[#ef4444]",
          label: "Material Cavity Void"
        }
      case "liquid":
        return {
          badge: "bg-[#f0f9ff] text-[#0369a1] border-[#bae6fd]",
          bar: "from-[#0284c7] to-[#38bdf8]",
          label: "Fluid Seepage / Stain"
        }
      case "color":
        return {
          badge: "bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]",
          bar: "from-[#7e22ce] to-[#c084fc]",
          label: "Pigment Discoloration"
        }
      case "combined":
        return {
          badge: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
          bar: "from-[#be123c] to-[#fb7185]",
          label: "Multi-Defect Region"
        }
      default:
        return {
          badge: "bg-[#f1f5f9] text-[#334155] border-[#cbd5e1]",
          bar: "from-[#1b4332] to-[#52b788]",
          label: "Anomaly Detected"
        }
    }
  }

  // Format confidence nicely to percentage
  const numConfidence = typeof confidence === "number" 
    ? (confidence > 1 ? confidence : confidence * 100) 
    : parseFloat(confidence || 0)

  const displayConfidence = numConfidence > 1 
    ? numConfidence.toFixed(2) 
    : (numConfidence * 100).toFixed(2)

  const theme = getDefectTheme(predictedClass)

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Side-by-Side Visual Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Original Specimen Input Frame */}
        <div className="bg-white border border-[#e8e3da] rounded-2xl p-6 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              {originalLabel}
            </span>
            <span className="text-[11px] font-mono text-[#64748b] bg-[#f7f5f0] px-2.5 py-1 rounded-md border border-[#e8e3da]">
              224 &times; 224 RGB
            </span>
          </div>

          <div className="w-full aspect-square max-w-sm rounded-xl overflow-hidden bg-[#faf8f5] border border-[#e8e3da] flex items-center justify-center relative shadow-inner">
            {originalImage ? (
              <img
                src={originalImage}
                alt={originalLabel}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-[#94a3b8] text-sm">Awaiting specimen image...</div>
            )}
          </div>
        </div>

        {/* Card 2: Grad-CAM Explainable AI Heatmap */}
        <div className="bg-white border border-[#e8e3da] rounded-2xl p-6 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b4332]">
              Grad-CAM Visual Heatmap
            </span>
            {heatmapImage && (
              <span className="text-[11px] font-mono text-[#1b4332] bg-[#e8f5e9] px-2.5 py-1 rounded-md border border-[#c8e6c9] font-semibold">
                layer4 attention
              </span>
            )}
          </div>

          <div className="w-full aspect-square max-w-sm rounded-xl overflow-hidden bg-[#faf8f5] border border-[#e8e3da] flex items-center justify-center relative shadow-inner">
            {heatmapImage ? (
              <img
                src={heatmapImage}
                alt="Grad-CAM Heatmap"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6 text-[#94a3b8]">
                {loading ? (
                  <div className="space-y-3">
                    <div className="w-8 h-8 border-3 border-[#1b4332] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm font-medium text-[#1b4332]">Computing convolutional gradients...</p>
                  </div>
                ) : (
                  <p className="text-sm">Heatmap overlay will render upon analysis</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostic Results Summary Card */}
      {predictedClass && (
        <div className="bg-white border border-[#e8e3da] rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#e8e3da]">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#64748b] font-bold">
                Classification Diagnosis
              </span>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-4 py-1.5 rounded-xl text-base font-extrabold uppercase tracking-wide border shadow-xs ${theme.badge}`}>
                  {predictedClass}
                </span>
                <span className="text-xs font-medium text-[#64748b]">
                  {theme.label}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs uppercase tracking-widest text-[#64748b] font-bold">
                Model Confidence
              </span>
              <div className="text-3xl font-mono font-bold text-[#1b4332] mt-1">
                {displayConfidence}%
              </div>
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="my-6">
            <div className="flex justify-between text-xs text-[#64748b] mb-2 font-medium">
              <span>Softmax Probability</span>
              <span className="font-bold text-[#1e293b]">{displayConfidence}% Certainty</span>
            </div>
            <div className="w-full bg-[#f1ede6] rounded-full h-3 p-0.5 border border-[#e8e3da] overflow-hidden">
              <div
                className={`bg-gradient-to-r ${theme.bar} h-full rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(parseFloat(displayConfidence), 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Explainable AI Insight Box */}
          {explanation && (
            <div className="p-5 rounded-xl bg-[#faf8f5] border border-[#e8e3da] text-[#334155] text-sm leading-relaxed">
              <span className="text-[#1b4332] font-bold text-xs uppercase tracking-wider block mb-1.5 font-mono">
                Explainable AI (Grad-CAM) Insight:
              </span>
              <p className="text-[#334155] leading-relaxed">{explanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
