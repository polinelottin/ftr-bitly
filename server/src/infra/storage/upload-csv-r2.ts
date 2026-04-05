import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { env } from '@/env'

export function isR2CsvExportEnabled(): boolean {
  return Boolean(
    env.CLOUDFLARE_ACCOUNT_ID &&
      env.CLOUDFLARE_ACCESS_KEY_ID &&
      env.CLOUDFLARE_SECRET_ACCESS_KEY &&
      env.CLOUDFLARE_BUCKET &&
      env.CLOUDFLARE_PUBLIC_URL,
  )
}

function publicObjectUrl(key: string): string {
  const base = env.CLOUDFLARE_PUBLIC_URL!.replace(/\/+$/, '')
  return `${base}/${key.replace(/^\/+/, '')}`
}

/**
 * Envia o CSV para um bucket R2 (API S3) e devolve a URL pública (CDN / domínio customizado).
 */
export async function uploadExportedCsvToR2(params: {
  csvContent: string
  filename: string
}): Promise<string> {
  const key = `exports/${params.filename}`

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.CLOUDFLARE_ACCESS_KEY_ID!,
      secretAccessKey: env.CLOUDFLARE_SECRET_ACCESS_KEY!,
    },
  })

  await client.send(
    new PutObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET!,
      Key: key,
      Body: Buffer.from(params.csvContent, 'utf-8'),
      ContentType: 'text/csv; charset=utf-8',
      ContentDisposition: `attachment; filename="${params.filename}"`,
    }),
  )

  return publicObjectUrl(key)
}
