import YAML from 'js-yaml-parser'
import axios from 'axios'

import Resources from 'components/Resources'

function Test({ config }) {
  return <Resources config={config} />
}

export default Test

export async function getServerSideProps(context) {
  // 1. Get from context url
  const urlFromContext = 'vcana.com/project/kz_kaz-simp-text/tit/1/step-3' // TODO - get real link
  // 2. Get from url book, chapter,number of step
  const [book, chapter, step] = urlFromContext.split('/').slice(-3)
  const reference = {
    book,
    chapter,
    step: step.split('-').slice(-1)[0],
    verses: ['2', '4', '6', '12'],
  }

  // 3. Get request to Supabase and get owner,repo,commit,manifest

  const manifests = await Promise.all([
    // axios.get('https://git.door43.org/ru_gl/ru_rlob/raw/branch/master/manifest.yaml'),
    axios.get(
      'https://git.door43.org/DevleskoDrom/uk_onpu/raw/branch/master/manifest.yaml'
    ),
    axios.get('https://git.door43.org/ru_gl/ru_rsob/raw/branch/master/manifest.yaml'),
    axios.get('https://git.door43.org/ru_gl/ru_tn/raw/branch/master/manifest.yaml'),

    axios.get(
      'https://git.door43.org/unfoldingWord/en_tq/raw/branch/master/manifest.yaml'
    ),

    axios.get('https://git.door43.org/ru_gl/ru_twl/raw/branch/master/manifest.yaml'),

    axios.get('https://git.door43.org/ru_gl/ru_obs/raw/branch/master/manifest.yaml'),

    axios.get('https://git.door43.org/ru_gl/ru_obs-tn/raw/branch/master/manifest.yaml'),

    axios.get('https://git.door43.org/ru_gl/ru_obs-tq/raw/branch/master/manifest.yaml'),
    axios.get('https://git.door43.org/ru_gl/ru_obs-twl/raw/branch/master/manifest.yaml'),
  ])

  const [
    manifest_onpu,
    manifest_rsob,
    manifest_tn,
    manifest_tq,
    manifest_twl,
    manifest_obs,
    manifest_obs_tn,
    manifest_obs_tq,
    manifest_obs_twl,
  ] = await manifests.map((el) => {
    return YAML.load(el.data)
  })

  const mainMock = [
    {
      owner: 'DevleskoDrom',
      repo: 'onpu',
      commit: '209a944b5d9e6d15833a807d8fe771c9758c7139',
      manifest: manifest_onpu,
    },
    {
      owner: 'ru_gl',
      repo: 'rsob',
      commit: '38c10e570082cc615e45628ae7ea3f38d9b67b8c',
      manifest: manifest_rsob,
    },
    {
      owner: 'ru_gl',
      repo: 'tn',
      commit: 'f36b5a19fc6ebbd37a7baba671909cf71de775bc',
      manifest: manifest_tn,
    },
    {
      owner: 'unfoldingWord',
      repo: 'tq',
      commit: 'b09890c9166ba08d734c4acc9b232ad5f9c7a4f5',
      manifest: manifest_tq,
    },
    {
      owner: 'ru_gl',
      repo: 'twl',
      commit: '17383807b558d6a7268cb44a90ac105c864a2ca1',
      manifest: manifest_twl,
    },
    {
      owner: 'ru_gl',
      repo: 'obs',
      commit: '921aaa41e3fe2a24f1a66c789d1840abab019131',
      manifest: manifest_obs,
    },
    {
      owner: 'ru_gl',
      repo: 'obs-tn',
      commit: '9c418b368b928e0cfdb8840cc8ddd418bcda5aec',
      manifest: manifest_obs_tn,
    },
    {
      owner: 'ru_gl',
      repo: 'obs-tq',
      commit: 'a2cf962471519f6a17b5d1039e40cbce0c630603',
      manifest: manifest_obs_tq,
    },
    {
      owner: 'ru_gl',
      repo: 'obs-twl',
      commit: '9f3b5ac96ee5f3b86556d2a601faee4ecb1a0cad',
      manifest: manifest_obs_twl,
    },
  ]

  const resources = await mainMock.map((resource) => {
    const project = resource.manifest.projects.find(
      (project) => project.identifier === book
    )
    const {
      format,
      title,
      subject,
      language: { identifier },
    } = resource?.manifest.dublin_core
    return {
      ...resource,
      bookPath: project?.path ?? null,
      manifest: {},
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
