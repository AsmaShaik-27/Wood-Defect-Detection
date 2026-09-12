import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { killAllCameraStreams } from "../utils/camera"

export default function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    killAllCameraStreams()
  }, [])

  const valueProps = [
    {
      number: "01",
      title: "Sub-Millimeter Surface Precision",
      description: "Deep vision models find tiny cracks, fiber cuts, and resin spots that are easily missed by the human eye."
    },
    {
      number: "02",
      title: "Explainable AI (Grad-CAM)",
      description: "Clear visual heatmaps highlight the exact problem area so you can easily verify why a defect was detected."
    },
    {
      number: "03",
      title: "Sub-15ms Real-Time Latency",
      description: "Fast processing designed for active conveyor belts and real-time production line checks."
    },
    {
      number: "04",
      title: "Reduced Material Waste",
      description: "Accurate defect sorting prevents unnecessary wood disposal and helps you salvage good material."
    }
  ]

  const workflowSteps = [
    {
      step: "Step 01",
      title: "Capture or Upload",
      description: "Connect a live camera to stream frames directly, or upload photos from your computer."
    },
    {
      step: "Step 02",
      title: "Deep Vision Analysis",
      description: "ResNet-18 neural network analyzes wood grain patterns and identifies defects instantly."
    },
    {
      step: "Step 03",
      title: "Explainable Diagnosis",
      description: "Grad-CAM generates a color-coded heatmap showing where the defect is located."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-[#1e293b]">
      <Header />

      {/* 1. HERO SECTION - Left text/buttons, Right image */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-8 border-b border-[#e8e3da] bg-[#faf8f5]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

            {/* Left Column: Heading, Subheading, and Two Buttons */}
            <div className="lg:col-span-7 text-left">
              {/* <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f5e9] border border-[#c8e6c9] text-[#1b4332] text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-[#2d6a4f]"></span>
                <span>Automated Quality Inspection</span>
              </div> */}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0f172a] leading-[1.15] mb-6">
                Wood Defect Detection System using Deep Learning &amp; Explainable AI
              </h1>

              <p className="text-lg sm:text-xl text-[#475569] leading-relaxed mb-8 max-w-xl">
                An automated inspection tool that scans wood surfaces in real time to find cracks, holes, scratches, and other defects.
              </p>

              {/* Two CTA Buttons - Soft sage green base #dff0e4 with #c7edd1 on hover */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate("/live")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-['Plus_Jakarta_Sans',sans-serif] text-sm sm:text-base font-bold tracking-wide text-[#143e2a] bg-[#dff0e4] border border-[#b7e2c3] shadow-xs hover:bg-[#c7edd1] hover:border-[#7ecf94] hover:shadow-md hover:shadow-[#1b4332]/12 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer"
                >
                  Live Camera
                </button>

                <button
                  onClick={() => navigate("/upload")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-['Plus_Jakarta_Sans',sans-serif] text-sm sm:text-base font-bold tracking-wide text-[#143e2a] bg-[#dff0e4] border border-[#b7e2c3] shadow-xs hover:bg-[#c7edd1] hover:border-[#7ecf94] hover:shadow-md hover:shadow-[#1b4332]/12 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] transition-all duration-300 ease-out cursor-pointer"
                >
                  Upload & Analyze
                </button>
              </div>
            </div>

            {/* Right Column: Hero Image Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-[#e8e3da] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-[#f7f5f0] border border-[#e8e3da]">
                  <img
                    src="/images/hero-scanner.png"
                    alt="Wood Defect Detection with Explainable Grad-CAM"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3 rounded-xl border border-[#e8e3da] shadow-sm flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1b4332] animate-pulse"></span>
                      <span className="font-bold text-[#0f172a]">Real-Time Inspection</span>
                    </div>
                    <span className="font-mono text-[#1b4332] bg-[#e8f5e9] px-2 py-0.5 rounded font-semibold border border-[#c8e6c9]">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. WHY CLEARINSPECT? - Simple subheading & card hover animations */}
      <section className="py-20 px-4 sm:px-8 border-b border-[#e8e3da] bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1b4332] block mb-2 font-mono">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0f172a]">
              Why ClearInspect?
            </h2>
            <p className="text-[#64748b] text-base mt-3">
              Reliable and fast wood inspection that helps you catch surface defects early, maintain high quality, and reduce waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valueProps.map((item) => (
              <div
                key={item.number}
                className="bg-[#faf8f5] border border-[#e8e3da] rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-md hover:border-[#1b4332]/40 transition-all duration-300 cursor-default"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[#936639] block mb-4">
                    {item.number}
                  </span>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PIPELINE - With card hover animations */}
      <section className="py-20 px-4 sm:px-8 bg-[#faf8f5] border-b border-[#e8e3da]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1b4332] block mb-2 font-mono">
              Pipeline Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0f172a]">
              How the Inspection System Works
            </h2>
            <p className="text-[#64748b] text-base mt-3">
              A streamlined three-step workflow translating raw optical camera pixels into verified actionable diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {workflowSteps.map((item, idx) => (
              <div
                key={item.step}
                className="bg-white border border-[#e8e3da] rounded-2xl p-8 relative flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-md hover:border-[#1b4332]/40 transition-all duration-300 cursor-default"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-2.5 py-1 rounded-md border border-[#c8e6c9] inline-block mb-4">
                    {item.step}
                  </span>
                  <h3 className="text-xl font-bold text-[#0f172a] mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {item.description}
                  </p>
                </div>
                <div className="mt-8 text-xs font-bold text-[#936639]">
                  Phase {idx + 1} of 3
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accuracy, Latency, CNN Model, and Start Wood Surface Inspection sections removed per user instructions */}

      <Footer />
    </div>
  )
}