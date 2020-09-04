const { google } = require('googleapis')
const axios = require('axios')
const { dockStart } = require('@nlpjs/basic');

const {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY
} = process.env

const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n')
const apiUrl = 'https://graduate-16c74.firebaseio.com/model.json'
const scopes = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/firebase.database"
];
const jwt = new google.auth.JWT(GOOGLE_CLIENT_EMAIL, null, privateKey, scopes);

exports.handler = async function (event, context) {
    const receivedMessage = event.queryStringParameters.message

    try {

        // create Google API token
        const token = await new Promise((resolve, reject) => jwt.authorize(async (error, tokens) => {
            if (error) {
                reject(new Error('Error making request to generate token'))
            } else if (!tokens.access_token) {
                reject(new Error('Provided service account doest not have permission to generate access tokens'))
            }
            resolve(tokens.access_token)
        }))

        if (!token) {
            return null;
        }

        // headers and token needed for firebase GET call 
        const headers = { Authorization: 'Bearer ' + token }

        // Firebase GET call, destructured to data
        const { data } = await axios.get(apiUrl, { headers })

        // NLP manager
        const dock = await dockStart({ use: ['Basic'], autoSave: false });

        // Setup NLP
        const nlp = dock.get('nlp');

        // Import data
        nlp.import(data);

        const result = await nlp.process(receivedMessage)

        console.log({ result });

        // return the data
        return {
            statusCode: 200,
            body: `${JSON.stringify(result)}`,
        }
    } catch (e) {
        // throw new Error('Error fetching Google Analytics data')
        return {
            statusCode: 500,
            body: e.message
        }
    }
};