import {Builder} from '../../../src/lib/builder'

const contentGroup = {name: 'content', title: 'Content', default: true}
const seoGroup = {name: 'seo', title: 'SEO'}
const groups = [contentGroup, seoGroup]

export const abstractWebPage = new Builder()
  .setSchema({
    type: 'document',
    name: 'page',
    groups,
    fields: [
      {
        name: 'seoTitle',
        title: 'Title (Open Graph)',
        type: 'string',
        group: seoGroup.name,
        description: 'Used for Open Graph previews implemented  by facebook, twitter, google etc.',
      },
      {
        name: 'seoDescription',
        title: 'Description (Open Graph)',
        type: 'string',
        group: seoGroup.name,
      },
      {
        name: 'seoKeywords',
        type: 'array',
        group: seoGroup.name,
        options: {
          layout: 'tags',
        },
        of: [{name: 'keyword', type: 'string'}],
      },
      {
        name: 'seoShareImage',
        title: 'Image (Open Graph)',
        group: seoGroup.name,
        description: '1200x630px recommended',
        type: 'image',
        options: {
          hotspot: true,
        },
      },
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
      "seoTitle": coalesce(seoTitle[$lang], seoTitle.en),
      "seoDescription": coalesce(seoDescription[$lang], seoDescription.en),
       seoKeywords
    `
  )
