import {defineCliConfig} from 'sanity/cli'
import {sanityDatacomposer, } from '../../src/framework/vite-plugin'


export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
    dataset: process.env.SANITY_STUDIO_DATASET!,
  },
  vite: {
    plugins: [
      sanityDatacomposer({
        builderIn: 'data-layer/composables/',
        queryOut: 'data-layer/queries/',
        schemaOut: 'data-layer/schema/',
      }),
    ]
  },
})
