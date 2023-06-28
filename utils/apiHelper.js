import { setup } from 'axios-cache-adapter'
import Path from 'path'
import localforage from 'localforage'
import jszip from 'jszip'

const DEFAULT_MAX_AGE = 24 * 30 // cache 30 days

const zipStore = localforage.createInstance({
  driver: [localforage.INDEXEDDB],
  name: 'zip-store',
})

export const api = setup({
  cache: {
    store: zipStore,
    maxAge: DEFAULT_MAX_AGE * 60 * 60 * 1000,
  },
})

export const fetchFileFromServer = async ({ owner, repo, commit = '', apiUrl }) => {
  if (!owner || !repo) {
    return null
  }
  try {
    const response = await api.get(apiUrl, {
      responseType: 'arraybuffer',
      params: {
        owner,
        repo,
      },
    })
    const zip = response.data
    if (zip) {
      const uriZip = Path.join(owner, repo, commit)
      zipStore.setItem(uriZip, zip)
      return await jszip.loadAsync(zip)
    }
  } catch (error) {
    return null
  }
}

export const getFileFromZip = async ({ owner, repo, commit = '' }) => {
  let file
  const uriZip = Path.join(owner, repo, commit)
  const zipBlob = await zipStore.getItem(uriZip)
  try {
    if (zipBlob) {
      const zip = await jszip.loadAsync(zipBlob)
      file = zip
    }
  } catch (error) {
    console.log(error)
    file = null
  }
  return file
}

export const getFile = async ({ owner, repo, commit, apiUrl }) => {
  const file = await getFileFromZip({ owner, repo, commit })
  if (!file) {
    return await fetchFileFromServer({ owner, repo, commit, apiUrl })
  } else {
    return file
  }
}
