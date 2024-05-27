import axios from 'axios'
import JSZip from 'jszip'
import { countOfChaptersAndVerses } from 'utils/helper'
import supabaseApi from 'utils/supabaseServer'

export default async function downloadZipHandler(req, res) {
  try {
    let supabase
    try {
      supabase = await supabaseApi({ req, res })
    } catch (error) {
      return res.status(401).json({ error })
    }
    const { project_code, book_code } = req.query
    if (!project_code || !book_code) {
      return res.status(400).json({ error: 'bad request' })
    }
    const { data: project, error } = await supabase
      .from('projects')
      .select(
        'id, title, orig_title, code, type, method, languages(id,orig_name,code), dictionaries_alphabet, base_manifest,resources'
      )
      .eq('code', project_code)
      .maybeSingle()
    const bookLink = project.base_manifest.books.find(
      (book) => book.name === book_code
    )?.link
    if (!bookLink) {
      return res.status(400).json({ error: 'bad request' })
    }

    const createChapters = async (bookLink) => {
      if (bookLink) {
        const { data: jsonChapterVerse, error: errorJsonChapterVerse } =
          await countOfChaptersAndVerses({
            link: bookLink,
          })
        const newChapters = {}
        for (const chapterNum in jsonChapterVerse) {
          if (Object.hasOwnProperty.call(jsonChapterVerse, chapterNum)) {
            const verses = jsonChapterVerse[chapterNum]
            const newVerses = {}
            for (let index = 1; index < verses + 1; index++) {
              newVerses[index] = { text: '', enabled: false, history: [] }
            }
            newChapters[chapterNum] = newVerses
          }
        }
        return newChapters
      }
    }
    const getResources = async (resources) => {
      const urls = {}
      for (const resource in resources) {
        if (Object.hasOwnProperty.call(resources, resource)) {
          const { owner, repo, commit, manifest } = resources[resource]
          const bookPath = manifest.projects.find(
            (el) => el.identifier === book_code
          )?.path
          let url = ''
          if (bookPath.slice(0, 2) === './') {
            url = `${
              process.env.NODE_HOST ?? 'https://git.door43.org'
            }/${owner}/${repo}/raw/commit/${commit}${bookPath.slice(1)}`
          } else {
            url = `${
              process.env.NODE_HOST ?? 'https://git.door43.org'
            }/${owner}/${repo}/raw/commit/${commit}/${bookPath}`
          }
          urls[resource] = url
        }
      }

      return urls
    }

    const createAndDownloadArchive = async () => {
      const chapters = await createChapters(bookLink)
      const zip = new JSZip()

      const files = ['personal-notes.json', 'dictionary.json', 'team-notes.json']
      const folders = ['personal-notes', 'dictionary', 'team-notes', 'chapters']

      files.forEach((filename) => {
        zip.file(filename, '{}')
      })

      folders.forEach((foldername) => {
        zip.folder(foldername)
      })
      const resources = await getResources(project.resources)
      for (const resource in resources) {
        if (Object.hasOwnProperty.call(resources, resource)) {
          const url = resources[resource]
          try {
            const response = await axios.get(url)

            if (response.status === 200) {
              const content = response.data

              zip.file(`${resource}.${url.split('.').pop()}`, content)
            } else {
              console.error(`Не удалось загрузить: ${url}`)
            }
          } catch (error) {
            console.error(`Ошибка при запросе к: ${url}`, error)
          }
        }
      }

      const chaptersFolder = zip.folder('chapters')
      if (chapters) {
        Object.keys(chapters).forEach((chapterNumber) => {
          const chapterData = chapters[chapterNumber]
          const chapterFileName = `${chapterNumber}.json`
          chaptersFolder.file(chapterFileName, JSON.stringify(chapterData))
        })
      }

      return zip
    }

    const zip = await createAndDownloadArchive()

    const zipStream = await zip.generateNodeStream({
      type: 'nodebuffer',
      streamFiles: true,
    })
    res.setHeader('Content-Type', 'application/zip')

    res.setHeader('Content-Disposition', `attachment; filename=archive.zip`)

    zipStream.pipe(res).on('finish', function () {
      res.status(200).end()
    })
  } catch (error) {
    return res.status(404).json({ error })
  }
}
