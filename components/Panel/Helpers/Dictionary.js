import { useEffect, useState } from 'react'

import { useRouter } from 'next/router'

import dynamic from 'next/dynamic'

import axios from 'axios'

import { useTranslation } from 'next-i18next'

import { useCurrentUser } from 'lib/UserContext'
import { useProject, useDictionary } from 'utils/hooks'
import { supabase } from 'utils/supabaseClient'

import Close from 'public/close.svg'
import Waste from 'public/waste.svg'
import Modal from 'components/Modal'

const Redactor = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.Redactor),
  {
    ssr: false,
  }
)

const ListOfNotes = dynamic(
  () => import('@texttree/notepad-rcl').then((mod) => mod.ListOfNotes),
  {
    ssr: false,
  }
)

function Dictionary() {
  const [wordId, setWordId] = useState('test_wordId')
  const [editable, setEditable] = useState(false)
  const [activeWord, setActiveWord] = useState()
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [wordToDel, setWordToDel] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [words, setWords] = useState([])

  const { t } = useTranslation(['common'])
  const { user } = useCurrentUser()

  const {
    query: { project: code },
  } = useRouter()
  const [project] = useProject({ token: user?.access_token, code })

  const [allWords, { loading, error, mutate }] = useDictionary({
    token: user?.access_token,
    project_id: project?.id,
  })

  const getWords = async (searchQuery) => {
    const { data, error } = await supabase
      .from('dictionary')
      .select('*')
      .eq('project_id', project?.id)
      .ilike('title', `${searchQuery}%`)
      .order('title', { ascending: true })
    if (data && data.length) {
      setWords(data)
    } else {
      setWords([])
    }
  }
  useEffect(() => {
    if (allWords) {
      setWords(allWords)
    }
  }, [allWords])

  const filterByLetter = (letter) => {
    if (letter && letter !== 'all') {
      getWords(letter)
    } else {
      setWords(allWords)
    }
  }

  useEffect(() => {
    const getLevel = async () => {
      const level = await supabase.rpc('authorize', {
        user_id: user.id,
        project_id: project.id,
      })
      setEditable(['admin', 'coordinator', 'moderator'].includes(level.data))
    }
    if ((user?.id, project?.id)) {
      getLevel()
    }
  }, [user?.id, project?.id])

  useEffect(() => {
    const currentNote = words?.find((el) => el.id === wordId)
    setActiveWord(currentNote)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordId, words])

  const addNote = () => {
    const id = ('000000000' + Math.random().toString(36).substring(2, 9)).slice(-9)
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .post('/api/dictionary', { id, project_id: project?.id })
      .then((res) => setActiveWord(res.data[0]))
      .catch((err) => console.log(err))
  }
  const removeNote = (id) => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .delete(`/api/dictionary/${id}`)
      .then(() => mutate())
      .catch((err) => console.log(err))
  }
  const saveWord = () => {
    axios.defaults.headers.common['token'] = user?.access_token
    axios
      .put(`/api/dictionary/${activeWord?.id}`, activeWord)
      .then(() => mutate())
      .catch((err) => console.log(err))
  }
  const search = () => {
    getWords(searchQuery)
  }
  useEffect(() => {
    if (!activeWord || !editable) {
      return
    }
    const timer = setTimeout(() => {
      saveWord()
    }, 2000)
    return () => {
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWord, editable])
  return (
    <div className="relative">
      {!activeWord ? (
        <div className="relative">
          <div className=" mr-11">
            <Alphabet filterByLetter={filterByLetter} />
          </div>
          <input
            className="input max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-cyan m-2" onClick={search}>
            {t('Search')}
          </button>
          {editable && (
            <div className="absolute top-0 right-0 ">
              <button
                className="btn-cyan text-xl font-bold mb-4 right-0"
                onClick={addNote}
              >
                +
              </button>
            </div>
          )}
          {words?.length ? (
            <ListOfNotes
              notes={words}
              removeNote={(e) => {
                setIsOpenModal(true)
                setWordToDel(words?.find((el) => el.id === e))
              }}
              setNoteId={setWordId}
              classes={{
                item: 'rounded-lg cursor-pointer flex justify-between items-start group hover:bg-blue-100/75',
                title: 'font-bold p-2 mr-4',
                text: 'px-2 h-10 overflow-hidden',
                delBtn: 'p-2 m-1 top-0 opacity-0 group-hover:opacity-100',
              }}
              isShowDelBtn={editable}
              delBtnChildren={<Waste className={'w-4 h-4 fill-gray-500'} />}
            />
          ) : (
            <div>{t('NoMatches')}</div>
          )}
        </div>
      ) : (
        <>
          <div
            className="absolute top-0 right-0 w-8 pt-3 pr-3 cursor-pointer"
            onClick={() => {
              setActiveWord(null)
              setWordId(null)
              saveWord()
            }}
          >
            <Close />
          </div>
          <Redactor
            classes={{
              wrapper: '',
              title: 'bg-cyan-50 p-2 font-bold rounded-lg my-4 shadow-md mr-12',
              redactor:
                'bg-cyan-50 pb-20 overflow-hidden break-words p-4 px-4 rounded-lg my-4 shadow-md',
            }}
            activeNote={activeWord}
            setActiveNote={setActiveWord}
            readOnly={!editable}
            placeholder={editable ? t('TextNewNote') : ''}
          />
        </>
      )}
      <Modal
        isOpen={isOpenModal}
        closeHandle={() => {
          setIsOpenModal(false)
        }}
      >
        {' '}
        <div className="text-center">
          <div className="mb-4">
            {t('AreYouSureDelete') + ' ' + t(wordToDel?.title) + '?'}
          </div>
          <button
            className="btn-cyan mx-2"
            onClick={() => {
              setIsOpenModal(false)
              if (wordToDel) {
                removeNote(wordToDel.id)
                setWordToDel(null)
              }
            }}
          >
            {t('Yes')}
          </button>
          <button
            className="btn-cyan mx-2"
            onClick={() => {
              setWordToDel(null)
              setIsOpenModal(false)
            }}
          >
            {t('No')}
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Dictionary

function Alphabet({ filterByLetter }) {
  const [alphabet, setAlphabet] = useState([])
  useEffect(() => {
    setAlphabet(generateAlphabets())
  }, [])
  function generateAlphabets() {
    var _alphabets = []
    var start = 'А'.charCodeAt(0)
    var last = 'Я'.charCodeAt(0)
    for (var i = start; i <= last; ++i) {
      _alphabets.push(String.fromCharCode(i))
    }
    _alphabets.push('All')
    return _alphabets
  }
  return (
    <div className="flex flex-wrap ">
      {alphabet &&
        alphabet?.map((el) => (
          <div
            onClick={() => filterByLetter(el.toLowerCase())}
            className="p-1 rounded-md cursor-pointer hover:bg-cyan-100"
            key={el}
          >
            {el === 'All' ? 'Показать все' : el}
          </div>
        ))}
    </div>
  )
}
