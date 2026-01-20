export class DuplicateShortUrlError extends Error {
  constructor() {
    super('Duplicate short URL. Please try again.')
  }
}
