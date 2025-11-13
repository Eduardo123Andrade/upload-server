import fastifyCors from '@fastify/cors'
import fastify from 'fastify'

const server = fastify()

server.register(fastifyCors, { origin: '*' })

server.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running on http://localhost:3333')
})
