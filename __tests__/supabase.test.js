import { supabase } from '@/utils/supabaseClient'

const user = {
  a: '5ccbe724-873e-48f8-9718-2e8b50b44540',
  t: '61e8b5a8-e7f6-4e1e-adfc-b9085f23508c',
  m: '10c37c65-f06c-4924-b4b1-f2377ef91008',
  c: '62a9a4d6-7a81-4a89-8622-d18946a73434',
}

const checkAdmin = [
  { req: { role: 'admin', from_user: user.a, to_user: user.a }, res: 'false' },
  { req: { role: 'admin', from_user: user.t, to_user: user.t }, res: 'false' },
  { req: { role: 'admin', from_user: user.m, to_user: user.m }, res: 'false' },
  { req: { role: 'admin', from_user: user.c, to_user: user.c }, res: 'false' },
  { req: { role: 'admin', from_user: user.a, to_user: user.t }, res: 'false' },
  { req: { role: 'admin', from_user: user.t, to_user: user.m }, res: 'false' },
  { req: { role: 'admin', from_user: user.m, to_user: user.c }, res: 'false' },
  { req: { role: 'admin', from_user: user.c, to_user: user.a }, res: 'false' },
]
const checkCoordinator = [
  { req: { role: 'coordinator', from_user: user.a, to_user: user.a }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.a, to_user: user.c }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.a, to_user: user.m }, res: 'true' },
  { req: { role: 'coordinator', from_user: user.a, to_user: user.t }, res: 'true' },
  { req: { role: 'coordinator', from_user: user.c, to_user: user.a }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.c, to_user: user.c }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.c, to_user: user.m }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.c, to_user: user.t }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.m, to_user: user.a }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.m, to_user: user.c }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.m, to_user: user.t }, res: 'false' },
  { req: { role: 'coordinator', from_user: user.t, to_user: user.t }, res: 'false' },
]
const checkModerator = [
  { req: { role: 'moderator', from_user: user.a, to_user: user.a }, res: 'false' },
  { req: { role: 'moderator', from_user: user.a, to_user: user.c }, res: 'true' },
  { req: { role: 'moderator', from_user: user.a, to_user: user.m }, res: 'false' },
  { req: { role: 'moderator', from_user: user.c, to_user: user.c }, res: 'false' },
  { req: { role: 'moderator', from_user: user.c, to_user: user.a }, res: 'false' },
  { req: { role: 'moderator', from_user: user.c, to_user: user.t }, res: 'true' },
  { req: { role: 'moderator', from_user: user.m, to_user: user.c }, res: 'false' },
  { req: { role: 'moderator', from_user: user.t, to_user: user.c }, res: 'false' },
]
const checkTranslator = [
  { req: { role: 'translator', from_user: user.a, to_user: user.a }, res: 'false' },
  { req: { role: 'translator', from_user: user.a, to_user: user.c }, res: 'true' },
  { req: { role: 'translator', from_user: user.a, to_user: user.m }, res: 'true' },
  { req: { role: 'translator', from_user: user.a, to_user: user.t }, res: 'false' },
  { req: { role: 'translator', from_user: user.c, to_user: user.a }, res: 'false' },
  { req: { role: 'translator', from_user: user.c, to_user: user.c }, res: 'false' },
  { req: { role: 'translator', from_user: user.c, to_user: user.m }, res: 'true' },
  { req: { role: 'translator', from_user: user.c, to_user: user.t }, res: 'false' },
  { req: { role: 'translator', from_user: user.m, to_user: user.a }, res: 'false' },
  { req: { role: 'translator', from_user: user.m, to_user: user.c }, res: 'false' },
  { req: { role: 'translator', from_user: user.m, to_user: user.m }, res: 'false' },
  { req: { role: 'translator', from_user: user.m, to_user: user.t }, res: 'false' },
  { req: { role: 'translator', from_user: user.t, to_user: user.a }, res: 'false' },
  { req: { role: 'translator', from_user: user.t, to_user: user.c }, res: 'false' },
  { req: { role: 'translator', from_user: user.t, to_user: user.m }, res: 'false' },
  { req: { role: 'translator', from_user: user.t, to_user: user.t }, res: 'false' },
]

describe('add permissions', () => {
  checkAdmin.forEach(async (el) => {
    it('all admins', async () => {
      const { data, error } = await supabase.rpc('can_change_role', el.req)
      expect(data).toEqual(el.res)
    })
  })

  checkCoordinator.forEach(async (el) => {
    it('all coordinators', async () => {
      const { data, error } = await supabase.rpc('can_change_role', el.req)
      expect(data).toEqual(el.res)
    })
  })

  checkModerator.forEach(async (el) => {
    it('all moderators', async () => {
      const { data, error } = await supabase.rpc('can_change_role', el.req)
      expect(data).toEqual(el.res)
    })
  })

  checkTranslator.forEach(async (el) => {
    it('all moderators', async () => {
      const { data, error } = await supabase.rpc('can_change_role', el.req)
      expect(data).toEqual(el.res)
    })
  })
})
