import callToAction from './call-to-action';
import mediaFactory from './media'
import { Builder } from "src/library/builder";

export default new Builder()
  .setSchema({
    type: 'array',
    name: 'gallery',
    of: [
      {
        name: 'slide',
        type: 'object',
        fields: [mediaFactory,  {name: 'caption', type: 'string'}],
      },
    ],
  })
  .setQuery(
    (slots) => /* groq */ `
    gallery[] {
      caption,
      _key,
      ${slots('slide')}
    }`
  )
