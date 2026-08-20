import { createServer } from 'node:http'

const port = Number.parseInt(process.env.PORT ?? '3000', 10)

const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ status: 'ok' }))
    return
  }

  response.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
  response.end(JSON.stringify({ error: 'NOT_FOUND' }))
})

server.listen(port, '0.0.0.0', () => {
  console.log(`API locale provisoire disponible sur le port ${port}.`)
})
