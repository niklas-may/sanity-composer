import {abstractWebPage} from './abstract-web-page'
import {Builder} from '../../../src/lib/builder'
import {callToActionsFactory} from './call-to-action'
import {galleryFactory} from './gallery'

export const document = new Builder()
  .mixin(abstractWebPage)
  .setSchema({
    type: 'document',
    name: 'page',
    fields: [
      {
        type: 'object',
        name: 'mainSection',
        group: 'content',
        fields: [
          {
            name: 'pageTitle',
            type: 'string',
          },
          galleryFactory,
        ],
      },
      callToActionsFactory.setGroup('content'),
    ],
    preview: {
      select: {
        title: 'mainSection.pageTitle',
      },
      prepare(args) {
        return {
          title: args.title,
        }
      },
    },
  })
  .setQuery(
    (slots) => /* groq */ `

      *[_id == 'home'] {
        mainSection {
          pageTitle,
          ${slots('mainSection')}
        },
        ${slots('page')}
        ${slots('mixin')}
      }

    `
  )
