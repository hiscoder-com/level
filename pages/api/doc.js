import { withSwagger } from 'next-swagger-doc'

const swaggerHandler = withSwagger({
  definition: {
    openapi: '3.0.3',
    consumes: ['application/json'],
    produces: ['application/json'],
    components: {
      securitySchemes: { ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'token' } },
    },
    info: {
      description: 'This documentation describes the V-Cana API.',
      title: 'V-CANA API.',
      license: {
        name: 'MIT',
        url: 'http://opensource.org/licenses/MIT',
      },
      version: '1.0.11',
    },
  },
  apiFolder: 'pages/api',
})
export default swaggerHandler()
