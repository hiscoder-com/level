import { calculateChaptersAndVerses } from '../../utils/helper'
import usfmData3JN from '../../mocks/65-3JN'
import multiChapterData from '../../mocks/13-1CH'

describe('calculateChaptersAndVerses', () => {
  test('should return correct verse counts for each chapter', () => {
    const result = calculateChaptersAndVerses(usfmData3JN)

    expect(result).toEqual({
      data: {
        1: 15,
      },
      error: null,
    })
  })
  test('should return correct verse counts for multiple chapters', () => {
    const result = calculateChaptersAndVerses(multiChapterData)

    expect(result).toEqual({
      data: {
        '1': 54,
        '2': 55,
        '3': 24,
        '4': 43,
        '5': 26,
        '6': 81,
        '7': 40,
        '8': 40,
        '9': 44,
        '10': 14,
        '11': 47,
        '12': 40,
        '13': 14,
        '14': 17,
        '15': 29,
        '16': 43,
        '17': 27,
        '18': 17,
        '19': 19,
        '20': 8,
        '21': 30,
        '22': 19,
        '23': 32,
        '24': 31,
        '25': 31,
        '26': 32,
        '27': 34,
        '28': 21,
        '29': 30,
      },
      error: null,
    })
  })

  test('should return an object for empty data', () => {
    const result = calculateChaptersAndVerses('')

    expect(result).toEqual({
      data: {},
      error: null,
    })
  })
})
