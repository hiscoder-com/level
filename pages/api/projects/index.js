import { supabase } from 'utils/supabaseClient'
import jsyaml from 'js-yaml'
import axios from 'axios'

export default async function languageProjectsHandler(req, res) {
  if (!req.headers.token) {
    res.status(401).json({ error: 'Access denied!' })
  }
  supabase.auth.setAuth(req.headers.token)

  const {
    body: { language_id, method_id, code, title, resources, steps },
    method,
  } = req

  switch (method) {
    case 'POST':
      try {
        // вот тут мы делаем валидацию и записываем в 2 таблицы. Какие входные данные - можно самому придумать. Или принять все поля формы, или json просто валидировать
        // сейчас тут не хватает валидации юрл
        const { data: current_method, error: methodError } = await supabase
          .from('methods')
          .select('*')
          .eq('id', method_id)
          .single()
        if (methodError) throw methodError
        /**
         * Сверить что все методы из ресурса пришли с формы. Так же получаем, какой ресурс основной
         * После этого получаем и парсим манифесты и записываем в базу.
         * Выполнить все в одной транзакции, что-то не пройдет надо чтобы ничего не записалось
         * Взять на пока что список шагов как есть, добавить только айди проекта и порядковый номер шага.
         * Но надо не забыть, что потом надо брать от юзера измененные тексты с формы создания проекта.
         * Я просто показываю примерно как все должно быть.
         * PS. Оказывается что транзакции не поддерживаются, по этому придется просто валидацию делать хорошо. Либо обрабатывать ошибки и удалять созданные записи
         */
        if (
          JSON.stringify(Object.keys(resources).sort()) !==
          JSON.stringify(Object.keys(current_method.resources).sort())
        ) {
          throw 'Resources not an equal'
        }
        let baseResource = {}
        const promises = Object.keys(resources).map(async (el) => {
          const url = resources[el].replace('/src/', '/raw/') + '/manifest.yaml'
          const { data } = await axios.get(url)
          const manifest = jsyaml.load(data, { json: true })
          if (current_method.resources[el]) {
            baseResource = { books: manifest.projects, name: el }
          }
          return {
            resource: el,
            url: resources[el],
            manifest,
          }
        })
        const manifests = await Promise.all(promises)

        let newResources = {}
        manifests.forEach((el) => {
          const url = el.url.split('://')[1].split('/')
          newResources[el.resource] = {
            owner: url[1],
            repo: url[2],
            commit: url[5],
            manifest: el.manifest,
          }
        })
        baseResource.books = baseResource.books.map((el) => ({
          name: el.identifier,
          link:
            resources[baseResource.name].replace('/src/', '/raw/') + el.path.substring(1),
        }))

        const { data, error } = await supabase.from('projects').insert([
          {
            title,
            code,
            language_id,
            type: current_method.type,
            resources: newResources,
            method: current_method.title,
            base_manifest: {
              resource: baseResource.name,
              books: baseResource.books,
            },
          },
        ])
        if (error) throw error

        current_method.steps.forEach(async (el, index) => {
          await supabase
            .from('steps')
            .insert([{ ...el, order: index + 1, project_id: data[0].id }])
        })
        res.setHeader('Location', `/projects/${data[0].code}`)
        res.status(201).json({})
      } catch (error) {
        return res.status(404).json({ error })
      }
      break
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id,title,code,type,method,languages!inner(*)')
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['POST', 'GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}
