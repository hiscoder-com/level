import { withSwagger } from 'next-swagger-doc'

const swaggerHandler = withSwagger({
  definition: {
    consumes: ['application/json'],
    produces: ['application/json'],
    schemes: ['https', 'http'],
    swagger: '2.0',
    info: {
      description: 'This documentation describes the V-Cana API.',
      title: 'V-CANA API.',
      license: {
        name: 'MIT',
        url: 'http://opensource.org/licenses/MIT',
      },
      version: '1.0.0',
    },

    securityDefinitions: {
      AuthorizationHeaderToken: {
        type: 'apiKey',
        name: 'token',
        in: 'header',
      },
    },
    security: [
      {
        AuthorizationHeaderToken: [],
      },
    ],
  },
  apiFolder: 'pages/api',
})
export default swaggerHandler()
