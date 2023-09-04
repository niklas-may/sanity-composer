import {Builder} from './../../../../../src/library/builder'

export default new Builder()
  .setSchema({
    type: 'globalObject',
    name: 'localeString',
    fieldsets: [
      {
        title: "Translations",
        name: "translations",
        options: { collapsible: true, collapsed: true },
      },
    ],
    fields: [
      {
        type: 'string',
        name: 'en',
        title: "English"
      },
      {
        type: 'string',
        name: 'de',
        title: "German",
        fieldset: "translations"
      },
    ],
  })
  .setQuery(
    (slots, name) => /* groq */ `
      "${name}": coalesce(${name}[$lang], ${name}.en)
`,
  )
