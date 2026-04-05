import { z } from 'zod'

const emptyToUndefined = (val: unknown) =>
  val === '' || val === null || val === undefined ? undefined : val

const optionalNonEmptyString = z.preprocess(
  emptyToUndefined,
  z.string().min(1).optional(),
)

const optionalPublicUrl = z.preprocess(emptyToUndefined, z.string().url().optional())

const envSchema = z
  .object({
    PORT: z.coerce.number().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    DATABASE_URL: z.string().url().startsWith('postgresql://'),
    CLOUDFLARE_ACCOUNT_ID: optionalNonEmptyString,
    CLOUDFLARE_ACCESS_KEY_ID: optionalNonEmptyString,
    CLOUDFLARE_SECRET_ACCESS_KEY: optionalNonEmptyString,
    CLOUDFLARE_BUCKET: optionalNonEmptyString,
    CLOUDFLARE_PUBLIC_URL: optionalPublicUrl,
  })
  .superRefine((data, ctx) => {
    const cf = [
      data.CLOUDFLARE_ACCOUNT_ID,
      data.CLOUDFLARE_ACCESS_KEY_ID,
      data.CLOUDFLARE_SECRET_ACCESS_KEY,
      data.CLOUDFLARE_BUCKET,
      data.CLOUDFLARE_PUBLIC_URL,
    ]
    const setCount = cf.filter(Boolean).length
    if (setCount > 0 && setCount < 5) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Cloudflare R2: defina todas as variáveis (CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_ACCESS_KEY_ID, CLOUDFLARE_SECRET_ACCESS_KEY, CLOUDFLARE_BUCKET, CLOUDFLARE_PUBLIC_URL) ou nenhuma para usar exportação CSV inline (desenvolvimento).',
        path: ['CLOUDFLARE_ACCOUNT_ID'],
      })
    }
    if (data.NODE_ENV === 'production' && setCount !== 5) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Em produção, todas as variáveis Cloudflare R2 são obrigatórias para exportar o CSV via URL pública (CDN).',
        path: ['CLOUDFLARE_ACCOUNT_ID'],
      })
    }
  })

export const env = envSchema.parse(process.env)
