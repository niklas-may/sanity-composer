import {Builder} from './../../../../../src/library/builder'
import mediaFactory from './media-factory'
import localeString from '../objects/locale-string-object'

export default new Builder()
  .setSchema({
    type: 'array',
    name: 'gallery',
    of: [
      {
        type: 'object',
        name: 'slide',
        fields: [
          mediaFactory, 
          localeString.setName('myTitle'),
          {name: 'caption', type: 'string'}
        ],
      },
    ],
  })
  .setQuery(
    (getQueriesAt) => /* groq */ `
    gallery[] {
      caption,
      _key,
      ${getQueriesAt('slide')}
     }`,
  )
