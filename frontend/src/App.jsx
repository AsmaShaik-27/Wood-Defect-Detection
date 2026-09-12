import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Demo from "./pages/Demo"
import UploadInspect from "./pages/UploadInspect"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/live" element={<Demo />} />
      <Route path="/demo" element={<Navigate to="/live" replace />} />
      <Route path="/upload" element={<UploadInspect />} />
    </Routes>
  )
}

export default App