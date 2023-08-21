import {mediaFactory} from './media'
import {Builder} from '../../../src/lib/builder'

export const galleryFactory = new Builder()
  .setSchema({
    type: 'array',
    name: 'gallery',
    of: [
      {
        name: 'slide',
        type: 'object',
        fields: [mediaFactory, {name: 'caption', type: 'string'}],
      },
    ],
  })
  .setQuery(
    (slots) => /* groq */ `
    gallery[] {
      _key,
      caption,
      ${slots('slide')}
    }`
  )
