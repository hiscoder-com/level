export const shuffle = (text) => {
  let j, temp
  const arr = text.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    temp = arr[j]
    arr[j] = arr[i]
    arr[i] = temp
  }
  return arr.join('')
}
