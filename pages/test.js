import YAML from 'js-yaml-parser'
import axios from 'axios'

import Resources from 'components/Resources'

function Test({ config }) {
  return <Resources config={config} />
}

export default Test

export async function getServerSideProps(context) {
  // 1. Get from context url
  const urlFromContext = 'vcana.com/project/kz_kaz-simp-text/tit/3/step-3' // TODO - get real link
  // 2. Get from url book, chapter,number of step
  const [book, chapter, step] = urlFromContext.split('/').slice(-3)
  const reference = {
    book,
    chapter,
    step: step.split('-').slice(-1)[0],
    verses: ['1', '2', '4', '5'],
  }
  // console.log(chapter)
  // 3. Get request to Supabase and get owner,repo,commit,manifest
  const [manifest_rlob, manifest_rsob, manifest_tn] = await Promise.all([
    axios.get('https://git.door43.org/ru_gl/ru_rlob/raw/branch/master/manifest.yaml'),
    axios.get('https://git.door43.org/ru_gl/ru_rsob/raw/branch/master/manifest.yaml'),
    axios.get('https://git.door43.org/ru_gl/ru_tn/raw/branch/master/manifest.yaml'),
  ])
  const mainMock = [
    {
      owner: 'ru_gl',
      repo: 'rlob',
      commit: 'fcfef9689dd6897892dbcced76ba8beb0eacaa62',
      manifest: manifest_rlob?.data, /// "manifest": "{}" ,будет объект, передаелать
    },
    {
      owner: 'ru_gl',
      repo: 'rsob',
      commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
      manifest: manifest_rsob?.data,
    },
    {
      owner: 'ru_gl',
      repo: 'tn',
      commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
      manifest: manifest_tn?.data,
    },
    {
      owner: 'ru_gl',
      repo: 'tq',
      commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
      manifest: manifest_tn?.data,
    },
    {
      owner: 'ru_gl',
      repo: 'twl',
      commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
      manifest: manifest_tn?.data,
    },
  ]
  const resources = mainMock.map((resource) => {
    const parseManifest = YAML.load(resource.manifest)
    const project = parseManifest.projects.find((project) => project.identifier === book)

    const {
      format,
      title,
      subject,
      language: { identifier },
    } = parseManifest.dublin_core

    return {
      ...resource,
      manifest: parseManifest,
      bookPath: project.path,
      format,
      title,
      subject,
      language: identifier,
    }
  })
  return {
    props: { config: { resources, reference } },
  }
}
