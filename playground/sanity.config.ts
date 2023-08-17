import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './data-layer/schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Sanity-Monolyth',

  projectId: 'gmpiajy6',
  dataset: 'production',

  plugins: [deskTool(), visionTool()],

  schema: {
    types: schemaTypes,
  },
})
