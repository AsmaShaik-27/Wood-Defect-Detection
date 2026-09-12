// Global reference to active stream
let globalMediaStream = null

export const setActiveStream = (stream) => {
  globalMediaStream = stream
}

export const getActiveStream = () => {
  return globalMediaStream
}

/**
 * Forcefully stops all video tracks and detaches srcObject from all video elements.
 * Guarantees the camera hardware is released and camera indicator LED turns off.
 */
export const killAllCameraStreams = () => {
  // 1. Stop globally tracked stream
  if (globalMediaStream) {
    try {
      const tracks = globalMediaStream.getTracks() || []
      tracks.forEach((track) => {
        track.enabled = false
        track.stop()
      })
    } catch (e) {
      console.warn("Could not stop global stream track", e)
    }
    globalMediaStream = null
  }

  // 2. Scan all video elements in DOM and stop their streams
  try {
    const videoElements = document.querySelectorAll("video")
    videoElements.forEach((video) => {
      if (video.srcObject && typeof video.srcObject.getTracks === "function") {
        video.srcObject.getTracks().forEach((track) => {
          track.enabled = false
          track.stop()
        })
        video.srcObject = null
      }
    })
  } catch (e) {
    console.warn("Could not scan video elements", e)
  }
}
