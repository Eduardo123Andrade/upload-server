import fastifyCors from '@fastify/cors'
import fastify from 'fastify'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    })
  }

  // Log the error for debugging
  console.error(error)

  return reply.status(500).send({
    message: 'Internal server error',
  })
})

server.register(fastifyCors, { origin: '*' })

server.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})
