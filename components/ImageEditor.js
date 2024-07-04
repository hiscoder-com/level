import { useState, useRef, useEffect } from 'react'

import axios from 'axios'
import toast from 'react-hot-toast'

import ButtonLoading from './ButtonLoading'

import Resize from 'public/minimize_icon.svg'

function ImageEditor({ selectedFile, id, updateAvatar, t, setSelectedFile }) {
  const canvasRef = useRef(null)
  const parentRef = useRef(null)
  const rangeSliderRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 })
  const [maxCropSize, setMaxCropSize] = useState(300)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: maxCropSize })
  const [isSaving, setIsSaving] = useState(false)

  const updateCropArea = (posX, posY) => {
    if (!isDragging || !canvasRef.current) return

    const dx = posX - startDrag.x
    const dy = posY - startDrag.y

    setCropArea((prev) => {
      let newX = Math.max(0, Math.min(prev.x + dx, canvasRef.current.width - prev.size))
      let newY = Math.max(0, Math.min(prev.y + dy, canvasRef.current.height - prev.size))

      return { ...prev, x: newX, y: newY }
    })

    setStartDrag({ x: posX, y: posY })
  }

  const isInsideCropArea = (x, y) => {
    return (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.size &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.size
    )
  }

  const getTouchCoords = (touchEvent) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: touchEvent.touches[0].clientX - rect.left,
      y: touchEvent.touches[0].clientY - rect.top,
    }
  }

  const onTouchStart = (e) => {
    const coords = getTouchCoords(e)
    const inside = isInsideCropArea(coords.x, coords.y)
    if (!inside) return
    setStartDrag({ x: coords.x, y: coords.y })
    setIsDragging(true)
  }

  const onTouchMove = (e) => {
    e.preventDefault()
    const coords = getTouchCoords(e)
    if (!isDragging || !isInsideCropArea(coords.x, coords.y)) return
    updateCropArea(coords.x, coords.y)
  }

  const onMouseDown = (e) => {
    const inside = isInsideCropArea(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    if (!inside) return
    setStartDrag({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY })
    setIsDragging(true)
    canvasRef.current.style.cursor = 'grabbing'
  }

  const onMouseMove = (e) => {
    const inside = isInsideCropArea(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    canvasRef.current.style.cursor = inside
      ? isDragging
        ? 'grabbing'
        : 'grab'
      : 'default'

    if (!isDragging || !inside) return
    updateCropArea(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
  }

  const onMouseUp = (e) => {
    setIsDragging(false)
    if (canvasRef.current) {
      const inside = isInsideCropArea(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
      canvasRef.current.style.cursor = inside ? 'grab' : 'default'
    }
  }

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab'
      }
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
    setIsSaving(true)

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

    const base64Image = croppedCanvas.toDataURL('image/png')
    const formData = new FormData()
    formData.append('file', base64Image)
    formData.append('userId', id)

    try {
      const response = await axios.post('/api/users/avatar_upload', formData)
      if (response.status === 200) {
        const { url, fileName } = response.data
        const newAvatar = {
          name: fileName,
          selected: true,
          url,
        }

        updateAvatar(id, url, newAvatar)
        setSelectedFile(null)
      } else {
        toast.error(t('UploadFailed'))
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error(t('UploadFailed'))
    }
    setIsSaving(false)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = parentRef.current

    if (canvas && parent && selectedFile) {
      const ctx = canvas.getContext('2d')
      const newImage = new Image()

      newImage.onload = () => {
        let { width, height } = newImage
        const maxCanvasWidth = parent.offsetWidth
        const maxCanvasHeight = parent.offsetHeight

        const scaleX = maxCanvasWidth / width
        const scaleY = maxCanvasHeight / height
        const scale = Math.min(scaleX, scaleY)

        if (scale < 1) {
          width *= scale
          height *= scale
        }

        setMaxCropSize(Math.min(width, height))

        canvas.width = width
        canvas.height = height
        ctx.drawImage(newImage, 0, 0, width, height)
        drawShading(ctx, canvas.width, canvas.height, cropArea)
        drawCropArea(ctx, cropArea)
      }
      newImage.onerror = () => {
        console.error('Error loading image.')
        toast.error(t('ImageUploadFailed'))
      }

      newImage.src = URL.createObjectURL(selectedFile)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropArea, selectedFile])

  useEffect(() => {
    setCropArea((prev) => ({
      ...prev,
      size: maxCropSize,
    }))
  }, [maxCropSize])

  function drawShading(ctx, canvasWidth, canvasHeight, { x, y, size }) {
    size = Math.round(size)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'

    ctx.fillRect(0, 0, canvasWidth, y)
    ctx.fillRect(0, y + size, canvasWidth, canvasHeight - y - size)
    ctx.fillRect(0, y, x, size)
    ctx.fillRect(x + size, y, canvasWidth - x - size, size)
  }

  function drawCropArea(ctx, { x, y, size }) {
    ctx.strokeRect(x, y, size, size)
  }

  useEffect(() => {
    const updateSliderTrack = () => {
      if (rangeSliderRef.current) {
        let percentage =
          ((rangeSliderRef.current.value - rangeSliderRef.current.min) /
            (rangeSliderRef.current.max - rangeSliderRef.current.min)) *
          100
        percentage = Math.max(5, percentage)
        rangeSliderRef.current.style.setProperty('--slider-pos', `${percentage}%`)
      }
    }

    rangeSliderRef.current.addEventListener('input', updateSliderTrack)
    updateSliderTrack()

    return () => {
      if (rangeSliderRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        rangeSliderRef.current.removeEventListener('input', updateSliderTrack)
      }
    }
  }, [maxCropSize])

  return (
    <div ref={parentRef} className="overflow-auto min-h-full bg-white z-10">
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid black', width: '100%', height: 'auto' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      />
      <div className="flex flex-col md:flex-row justify-between w-full mt-6 gap-5">
        <div className="flex items-center gap-3 w-full md:w-fit">
          <Resize className="w-6 h-6 stroke-th-text-primary" />
          <input
            ref={rangeSliderRef}
            type="range"
            min="65"
            max={maxCropSize}
            value={cropArea.size}
            onChange={onCropSizeChange}
          />
        </div>
        <ButtonLoading
          isLoading={isSaving}
          onClick={handleCrop}
          className="relative btn-primary w-full md:w-fit"
        >
          {t('Save')}
        </ButtonLoading>
      </div>
    </div>
  )
}

export default ImageEditor
