export const checkLSVal = (el, val, type = 'string', ext = false) => {
  let value
  switch (type) {
    case 'object':
      try {
        value = JSON.parse(localStorage.getItem(el))
      } catch (error) {
        localStorage.setItem(el, JSON.stringify(val))
        return val
      }
      break
    case 'boolean':
      if (localStorage.getItem(el) === null) {
        value = null
      } else {
        value = localStorage.getItem(el) === 'true'
      }
      break

    case 'string':
    default:
      value = localStorage.getItem(el)
      break
  }

  if (value === null || (ext && !value[ext])) {
    localStorage.setItem(el, type === 'string' ? val : JSON.stringify(val))
    return val
  } else {
    return value
  }
}
export const readableDate = (date) => {
  return new Date(date).toLocaleString('ru', {})
}
