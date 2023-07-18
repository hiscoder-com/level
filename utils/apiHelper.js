import axios from 'axios'
import localforage from 'localforage'
import jszip from 'jszip'

const zipStore = localforage.createInstance({
  driver: [localforage.INDEXEDDB],
  name: 'zip-store',
})

export const fetchFileFromServer = async ({ owner, repo, commit = '', apiUrl }) => {
  if (!owner || !repo) {
    return null
  }
  try {
    const response = await axios.get(apiUrl, {
      responseType: 'arraybuffer',
      params: {
        owner,
        repo,
      },
    })

    const zip = response.data
    if (zip) {
      const uriZip = owner + '/' + repo + '/' + commit
      zipStore.setItem(uriZip, zip)
      return await jszip.loadAsync(zip)
    }
  } catch (error) {
    return null
  }
}

export const getFileFromZip = async ({ owner, repo, commit = '' }) => {
  let file
  const uriZip = owner + '/' + repo + '/' + commit
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
