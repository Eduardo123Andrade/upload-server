import { jsonSchemaTransform } from 'fastify-type-provider-zod'

/**
 * Parameters -> return the type of parameters of a function
 *      Parameters<typeof jsonSchemaTransform>[0] ->
 *          gets the type of the first parameter of the jsonSchemaTransform function
 *
 */
type TransformSwaggerSchemaData = Parameters<typeof jsonSchemaTransform>[0]

export const transformSwaggerSchema = (data: TransformSwaggerSchemaData) => {
  const { schema, url } = jsonSchemaTransform(data)

  if (schema.consumes?.includes('multipart/form-data')) {
    // schema.consumes = ['multipart/form-data']
    if (schema.body === undefined) {
      schema.body = {
        type: 'object',
        required: [],
        properties: {},
      }
    }

    schema.body.properties.file = {
      type: 'string',
      format: 'binary',
    }

    schema.body.required.push('file')
  }

  return { schema, url }
}
