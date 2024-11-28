import { atom } from 'recoil'

const localStorageEffect =
  (key) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      try {
        if (savedValue.startsWith('{') || savedValue.startsWith('[')) {
          setSelf(JSON.parse(savedValue))
        } else {
          setSelf(savedValue)
        }
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error)
        localStorage.removeItem(key)
      }
    }

    onSet((newValue, _, isReset) => {
      if (isReset) {
        localStorage.removeItem(key)
      } else {
        if (typeof newValue === 'object') {
          localStorage.setItem(key, JSON.stringify(newValue))
        } else {
          localStorage.setItem(key, String(newValue))
        }
      }
    })
  }

export const checkedVersesBibleState = atom({
  key: 'checkedVersesBibleState',
  default: [],
})

export const inactiveState = atom({
  key: 'inactiveState',
  default: false,
})

export const stepConfigState = atom({
  key: 'stepConfigState',
  default: {
    count_of_users: '',
    time: 0,
    description: '',
    title: '',
    subtitle: '',
    last_step: 8,
    current_step: 1,
    project_code: '',
  },
})

export const projectIdState = atom({
  key: 'projectIdState',
  default: null,
})
export const currentVerse = atom({
  key: 'currentVerse',
  default: '1',
  effects: [localStorageEffect('currentScrollVerse')],
})

export const userAvatarState = atom({
  key: 'userAvatarState',
  default: { id: null, url: null },
})

export const modalsSidebar = atom({
  key: 'modalsSidebar',
  default: {
    aboutVersion: false,
    avatarSelector: false,
    notepad: false,
    tAcademy: false,
    writeToUs: false,
    about: false,
  },
})

export const isHideAllVersesState = atom({
  key: 'isHideAllVersesState',
  default: false,
})

export const indexImageCarousel = atom({
  key: 'indexImageCarousel',
  default: 0,
})
