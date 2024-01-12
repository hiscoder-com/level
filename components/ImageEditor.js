import React, { useState, useRef, useEffect } from 'react'

function ImageEditor({ selectedFile }) {
  const canvasRef = useRef(null)
  const [image, setImage] = useState(null)
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 100, height: 100 })
  const [resizeValue, setResizeValue] = useState(100)

  const [dragging, setDragging] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas && selectedFile) {
      const ctx = canvas.getContext('2d')
      const newImage = new Image()
      newImage.src = URL.createObjectURL(selectedFile)

      newImage.onload = () => {
        canvas.width = newImage.width
        canvas.height = newImage.height
        ctx.drawImage(newImage, 0, 0, newImage.width, newImage.height)
        setImage(newImage)
      }
    }
  }, [selectedFile])

  useEffect(() => {
    if (image && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      drawCropArea(ctx, cropArea.x, cropArea.y, resizeValue, resizeValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, cropArea, resizeValue])

  const drawCropArea = (ctx, x, y, width, height) => {
    if (!image) return

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.drawImage(image, 0, 0)
    ctx.strokeStyle = 'red'
    ctx.strokeRect(x, y, width, height)
  }

  const isInsideCropArea = (x, y) => {
    return (
      x > cropArea.x &&
      x < cropArea.x + resizeValue &&
      y > cropArea.y &&
      y < cropArea.y + resizeValue
    )
  }

  const onMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isInsideCropArea(x, y)) {
      setStartPos({ x, y })
      setDragging(true)
    }
  }

  const onMouseMove = (e) => {
    if (!dragging) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isInsideCropArea(x, y)) {
      const deltaX = x - startPos.x
      const deltaY = y - startPos.y

      setCropArea((prev) => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }))
      setStartPos({ x, y })

      const ctx = canvasRef.current.getContext('2d')
      drawCropArea(
        ctx,
        cropArea.x + deltaX,
        cropArea.y + deltaY,
        resizeValue,
        resizeValue
      )
    }
  }

  const onMouseUp = () => {
    setDragging(false)
  }

  const onResizeChange = (e) => {
    setResizeValue(e.target.value)
  }

  const cropAndSave = () => {
    if (!cropArea || !canvasRef.current) return

    const canvas = canvasRef.current
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = resizeValue
    croppedCanvas.height = resizeValue
    const croppedCtx = croppedCanvas.getContext('2d')

    croppedCtx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      resizeValue,
      resizeValue,
      0,
      0,
      resizeValue,
      resizeValue
    )
    const croppedImageData = croppedCanvas.toDataURL('image/jpeg')

    console.log('Cropped Image Data:', croppedImageData)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
      {cropArea && (
        <>
          <button onClick={cropAndSave}>Обрезать и сохранить</button>
          <input
            type="range"
            min="50"
            max="300"
            value={resizeValue}
            onChange={onResizeChange}
          />
        </>
      )}
    </div>
  )
}

export default ImageEditor
