import { openai } from '@ai-sdk/openai'
import { experimental_generateImage, tool } from 'ai'
import z from 'zod'

export const generateImage = tool({
  description: 'Generate an image',
  inputSchema: z.object({
    prompt: z.string().describe('The prompt to generate the image from'),
  }),
  execute: async ({ prompt }) => {
    const { image } = await experimental_generateImage({
      model: openai.imageModel('dall-e-3'),
      prompt,
    })
    // in production, save this image to blob storage and return a URL
    return { image: image.base64, prompt }
  },
})
