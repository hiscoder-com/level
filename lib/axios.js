import axios from 'axios'

const instance = axios.create()

instance.interceptors.request.use((config) => {
  const token = process.env.GIT_DOOR43_BEARER_TOKEN

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default instance
