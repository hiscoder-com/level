import { atom } from 'recoil'

export const translatedVersesState = atom({
  key: 'translatedVersesState',
  default: [],
})

export const checkedVersesBibleState = atom({
  key: 'checkedVersesBibleState',
  default: [],
})

export const stepConfigState = atom({
  key: 'stepConfigState',
  default: {
    count_of_users: '',
    time: 0,
    description: '',
    title: '',
    last_step: 8,
    current_step: 1,
    project_code: '',
  },
})
