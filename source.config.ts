import { defineConfig, defineDocs } from 'fumadocs-mdx/config'

export const docs = defineDocs({
  dir: 'src/content/docs',
})

export const blog = defineDocs({
  dir: 'src/content/blog',
})

export default defineConfig()
