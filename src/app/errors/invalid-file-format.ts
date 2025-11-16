export class InvalidFileFormatError extends Error {
  constructor() {
    super('Invalid file format')
    this.name = 'InvalidFileFormatError'
  }
}
