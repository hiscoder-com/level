import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'
import { parseManifests } from 'utils/helper'

export default async function languageProjectsHandler(req, res) {
  if (!req?.headers?.token) {
    return res.status(401).json({ error: 'Access denied!' })
  }

  const supabase = createPagesServerClient({ req, res })

  const {
    body: {
      language_id,
      method_id,
      code,
      title,
      resources,
      steps,
      customBriefs,
      isBriefEnable,
    },
    method,
  } = req
  // TODO не работает если создавать ОБС
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
        const { baseResource, newResources } = await parseManifests({
          resources,
          current_method,
        })

        //TODO когда выбираешь obs, вводишь коммит, а потом выбираешь bible - то летит ключ obs тоже
        const { data, error } = await supabase
          .from('projects')
          .insert([
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
          .select()

        if (error) throw error

        const { error: errorBrief } = await supabase.rpc('create_brief', {
          project_id: data[0].id,
          is_enable: isBriefEnable,
        })

        if (errorBrief) throw errorBrief

        let sorting = 1
        for (const step_el of current_method.steps) {
          await supabase
            .from('steps')
            .insert([{ ...step_el, sorting: sorting++, project_id: data[0].id }])
        }
        res.setHeader('Location', `/projects/${data[0].code}`)
        return res.status(201).json({})
      } catch (error) {
        return res.status(404).json({ error })
      }
    case 'GET':
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id,title,code,type,method,languages!inner(*)')
          .order('title', { ascending: true })
        if (error) throw error
        return res.status(200).json(data)
      } catch (error) {
        return res.status(404).json({ error })
      }
    default:
      res.setHeader('Allow', ['POST', 'GET'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
