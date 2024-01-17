import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

function ImageEditor({ selectedFile, id, updateAvatar, t, setSelectedFile }) {
  const canvasRef = useRef(null)
  const parentRef = useRef(null)
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, size: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 })

  const onMouseDown = (e) => {
    setStartDrag({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
    setIsDragging(true)
  }

  const onMouseMove = (e) => {
    if (!isDragging) return
    const canvas = canvasRef.current
    if (!canvas) return

    const dx = e.nativeEvent.offsetX - startDrag.x
    const dy = e.nativeEvent.offsetY - startDrag.y

    setCropArea((prev) => {
      // Вычисляем новые координаты
      let newX = prev.x + dx
      let newY = prev.y + dy

      // Ограничиваем перемещение по оси X
      newX = Math.max(0, newX)
      newX = Math.min(canvas.width - prev.size, newX)

      // Ограничиваем перемещение по оси Y
      newY = Math.max(0, newY)
      newY = Math.min(canvas.height - prev.size, newY)

      return {
        ...prev,
        x: newX,
        y: newY,
      }
    })

    setStartDrag({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
  }

  const onMouseUp = () => {
    setIsDragging(false)
  }

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
    }
  }

  const onCropSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10)
    const canvas = canvasRef.current
    if (!canvas) return

    setCropArea((prev) => {
      const maxX = canvas.width - prev.x
      const maxY = canvas.height - prev.y
      const adjustedSize = Math.min(newSize, maxX, maxY)

      return {
        ...prev,
        size: adjustedSize,
      }
    })
  }

  const handleCrop = async () => {
    const canvas = canvasRef.current
    if (!canvas || !cropArea) return

    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = cropArea.size
    croppedCanvas.height = cropArea.size
    const croppedCtx = croppedCanvas.getContext('2d')

    croppedCtx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      cropArea.size,
      cropArea.size,
      0,
      0,
      cropArea.size,
      cropArea.size
    )

    croppedCanvas.toBlob(async (blob) => {
      const formData = new FormData()
      formData.append('file', blob, 'avatar.png')
      formData.append('userId', id)

      try {
        const response = await axios.post('/api/user_avatar_upload', formData)
        if (response.status === 200) {
          const { url } = response.data
          updateAvatar(id, url)
          setSelectedFile(null)
        } else {
          toast.error(t('UploadFailed'))
        }
      } catch (error) {
        console.error('Error uploading avatar:', error)
        toast.error(t('UploadFailed'))
      }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = parentRef.current

    if (canvas && parent && selectedFile) {
      const ctx = canvas.getContext('2d')
      const newImage = new Image()
      newImage.src = URL.createObjectURL(selectedFile)

      newImage.onload = () => {
        let { width, height } = newImage
        const maxCanvasWidth = parent.offsetWidth
        const maxCanvasHeight = parent.offsetHeight

        // Вычисляем коэффициенты масштабирования для ширины и высоты
        const scaleX = maxCanvasWidth / width
        const scaleY = maxCanvasHeight / height
        const scale = Math.min(scaleX, scaleY)

        // Применяем масштабирование, если изображение больше холста
        if (scale < 1) {
          width *= scale
          height *= scale
        }

        canvas.width = width
        canvas.height = height
        ctx.drawImage(newImage, 0, 0, width, height)
        drawShading(ctx, canvas.width, canvas.height, cropArea)
        drawCropArea(ctx, cropArea)
      }
    }
  }, [cropArea, selectedFile])

  function drawShading(ctx, canvasWidth, canvasHeight, { x, y, size }) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

    // Верхний прямоугольник
    ctx.fillRect(0, 0, canvasWidth, y)

    // Нижний прямоугольник
    ctx.fillRect(0, y + size, canvasWidth, canvasHeight - y - size)

    // Левый прямоугольник
    ctx.fillRect(0, y, x, size)

    // Правый прямоугольник
    ctx.fillRect(x + size, y, canvasWidth - x - size, size)
  }

  function drawCropArea(ctx, { x, y, size }) {
    ctx.strokeStyle = 'red'
    ctx.strokeRect(x, y, size, size)
  }

  return (
    <div ref={parentRef}>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', width: '100%', height: 'auto' }}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
      <input
        type="range"
        min="50"
        max="500"
        value={cropArea.size}
        onChange={onCropSizeChange}
      />
      <button onClick={handleCrop}>Сохранить обрезанное изображение</button>
    </div>
  )
}

export default ImageEditor
