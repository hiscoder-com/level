import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'

function ImageEditor({ selectedFile, id }) {
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

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.drawImage(image, x, y, width, height, x, y, width, height)

    // рисуем круг
    // const radius = Math.min(width, height) / 2
    // const centerX = x + width / 2
    // const centerY = y + height / 2
    // ctx.beginPath()
    // ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    // ctx.stroke()

    // ctx.strokeRect(x, y, width, height)
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
      let deltaX = x - startPos.x
      let deltaY = y - startPos.y

      let newX = cropArea.x + deltaX
      let newY = cropArea.y + deltaY
      const maxX = canvasRef.current.width - resizeValue
      const maxY = canvasRef.current.height - resizeValue

      if (newX < 0) newX = 0
      if (newY < 0) newY = 0
      if (newX > maxX) newX = maxX
      if (newY > maxY) newY = maxY

      setCropArea((prev) => ({
        ...prev,
        x: newX,
        y: newY,
      }))
      setStartPos({ x, y })

      const ctx = canvasRef.current.getContext('2d')
      drawCropArea(ctx, newX, newY, resizeValue, resizeValue)
    }
  }

  const onMouseUp = () => {
    setDragging(false)
  }

  const onResizeChange = (e) => {
    setResizeValue(e.target.value)
  }

  const cropAndSave = async () => {
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
    // try {
    //   const response = await axios.post('/api/user_avatars_upload', {
    //     croppedImageData,
    //     userId: id,
    //   })

    //   console.log('Uploaded Image URL:', response.data.url)
    // } catch (error) {
    //   console.error('Error uploading cropped image:', error)
    // }
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
