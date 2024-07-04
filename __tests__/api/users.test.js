import handler from '../../pages/api/users/index'
import { supabase } from '../../utils/supabaseClient'
import { supabaseService } from '../../utils/supabaseService'

jest.mock('../../utils/supabaseService', () => ({
  __esModule: true,
  supabaseService: {
    auth: {
      api: {
        createUser: jest.fn(
          ({ email, password, user_metadata: { login }, email_confirm = false }) => {
            if (!email || !password || !login) {
              supabaseService.error.message = 'ERROR'
            }
            return supabaseService
          }
        ),
      },
    },
    error: undefined,
  },
}))

jest.mock('../../utils/supabaseClient', () => ({
  __esModule: true,
  supabase: (() => {
    const res = {
      token: false,
      auth: {
        setAuth: jest.fn((token) => (res.token = token === 'correct')),
      },
      data: undefined,
      error: undefined,
    }
    res.from = jest.fn(() => {
      if (!res.token) {
        res.error = {
          message:
            'JWSError (CompactDecodeError Invalid number of parts: Expected 3 parts; got 1)',
        }
      }
      return res
    })
    res.select = jest.fn(() => {
      if (res.token) {
        res.data = [{ id: '1', login: 'admin', agreement: true }]
      }
      return res
    })

    return res
  })(),
}))

const mockResponse = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.setHeader = jest.fn().mockReturnValue(res)
  res.end = jest.fn().mockReturnValue(res)
  return res
}

/**
 * 1. Проверить токен
 * 1.1. не пришел - ошибка 401
 * 1.2. пришел правильный - код выполняется дальше
 * 1.3. пришел непрвильный - выполняется код но должен что-то вернуть (404 ошибку, мы не можем отловить что ошибка в токене именно)
 * 2. Методы: только гет или пост. Другие не принимать, 405 ошибка
 * 3. Если гет
 * 3.1. Не знаю как отловить 404 ошибку.
 * 3.2. Если успешно то 200 и массив должен быть
 * 3.3. Если ничего нет - пустой массив приходит
 * 4. Для пост запроса
 * 4.1. Проверить, админ или нет
 * 4.2. Проверить что пришли все поля для создания
 * 4.3. Если такой юзер есть - вернет ошибку
 * 4.4. Если нет - создает юзера
 * 5. Проверять и status и json
 */
let res
beforeEach(() => {
  res = mockResponse()
  supabase.token = false
  supabase.error = undefined
  supabase.data = undefined

  supabaseService.error = undefined
})

describe('проверим api/users', () => {
  it('если нет токена то 401 ошибка', async () => {
    const req = {
      headers: {},
      body: {},
      method: 'GET',
    }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied!' })
  })

  it('если неправильный токен то 404 ошибка', async () => {
    const req = {
      headers: { token: 'incorrect' },
      body: {},
      method: 'GET',
    }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('если PUT запрос то 405 ошибка', async () => {
    const req = {
      headers: { token: 'correct' },
      method: 'PUT',
    }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.end).toHaveBeenCalledWith('Method PUT Not Allowed')
  })

  it('если DELETE запрос то 405 ошибка', async () => {
    const req = {
      headers: { token: 'correct' },
      body: { email: '', password: '', login: '' },
      method: 'DELETE',
    }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.end).toHaveBeenCalledWith('Method DELETE Not Allowed')
  })

  it('GET запрос вернул массив юзеров', async () => {
    const req = {
      headers: { token: 'correct' },
      body: {},
      method: 'GET',
    }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith([{ id: '1', login: 'admin', agreement: true }])
  })

  it('POST запрос вернул 404 потому что не прошла валидация', async () => {
    const req = {
      headers: { token: 'correct' },
      body: { email: '', password: '', login: '' },
      method: 'POST',
    }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('POST запрос вернул 201 и создал юзера', async () => {
    const req = {
      headers: { token: 'correct' },
      body: { email: 'test@mail.com', password: '123456', login: 'test' },
      method: 'POST',
    }
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({})
  })
})
