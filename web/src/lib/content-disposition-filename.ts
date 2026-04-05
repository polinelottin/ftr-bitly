/**
 * Extrai o nome do arquivo do header Content-Disposition (RFC 2183 / 5987).
 * Retorna null se não houver filename reconhecível.
 */
export function parseFilenameFromContentDisposition(disposition: string): string | null {
  if (!disposition?.trim()) {
    return null
  }

  const star = /filename\*=(?:UTF-8''|utf-8'')([^;\s]+)/i.exec(disposition)
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].replace(/^"(.*)"$/, '$1'))
    } catch {
      // continua para outros formatos
    }
  }

  const quoted = /filename\s*=\s*"((?:[^"\\]|\\.)*)"/i.exec(disposition)
  if (quoted?.[1]) {
    return quoted[1].replace(/\\"/g, '"')
  }

  const unquoted = /filename\s*=\s*([^;\s]+)/i.exec(disposition)
  if (unquoted?.[1]) {
    let v = unquoted[1]
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    return v
  }

  return null
}
