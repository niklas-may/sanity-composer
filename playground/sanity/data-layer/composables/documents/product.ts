import {Builder} from './../../../../../src/library/builder'
import webpage from '../mixins/web-page-mixin'
import galleryFactory from "../factories/gallery-factory"

export default new Builder()
  .mixin(webpage)
  .setSchema({
    type: 'document',
    name: 'product',
    fields: [
      {
        type: 'text',
        group: 'content',
        name: 'description',
      },
      {
        type: 'array',
        name: "sections",
        group: "content",
        of: [
          {
            type: "object",
            name: "gallery",
            fields: [
              galleryFactory
            ]

          }
        ]
      }
    ],
  })
  .setQuery(
    (getQueriesFrom) => /* groq */ `
      *[_type == 'home'] {
        ${getQueriesFrom('mixin')}
        ${getQueriesFrom('gallery')}
        ...
      }
`,
  )
