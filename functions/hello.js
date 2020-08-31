const randomQuotes = require('random-quotes');

exports.handler = async event => {
    // const subject = event.queryStringParameters.name || 'World'
    return {
      statusCode: 200,
      body: `${randomQuotes()}`,
    }


  }