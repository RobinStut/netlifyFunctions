const { google } = require('googleapis')
const axios = require('axios')
const { dockStart } = require('@nlpjs/basic');

const {
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PRIVATE_KEY
} = process.env

const privateKey = GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n')
const modelUrl = 'https://graduate-16c74.firebaseio.com/trainedModel.json'
const trainingHistoryUrl = 'https://graduate-16c74.firebaseio.com/trainingHistory.json/'
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

        // 1.   import het laatste nlp model.
        // Firebase GET call, destructured to data
        const { data: trainingHistory = data } = await axios.get(trainingHistoryUrl, { headers })
        const trainingData = Object.values(trainingHistory).map(data => data.trainingData)

        // NLP manager
        const dock = await dockStart({ use: ['Basic'], autoSave: false });
        const nlp = dock.get('nlp');

        // // Setup NLP

        nlp.addLanguage('nl');

        // 2.   ontvang nieuwe input voor het model. (vragen en antwoorden)

        const chatbotAnswerFallBack = []

        trainingData.forEach(chatbotOrUser => {
            for (const [key, value] of Object.entries(chatbotOrUser)) {
                value.forEach(input => {
                    if (!input) return
                    const { language, intent, utterance } = input
                    const chatbotOutput = key === 'chatbotReactionTrainingForm'

                    // 3.2  Zo nee, train model
                    if (chatbotOutput) {
                        chatbotAnswerFallBack.push({ language, intent, utterance })
                        nlp.addAnswer(language, intent, utterance);

                    }
                    else {
                        nlp.addDocument(language, utterance, intent);
                    }
                });
            }
        })

        await nlp.train()

        const result = await nlp.process('nl', receivedMessage)
        const { intent, answers } = result

        if (!answers.length && intent !== 'None') {
            const fallbackAnswer = chatbotAnswerFallBack.find(({ intent }) => intent === intent)
            if (fallbackAnswer) answers.push(fallbackAnswer.utterance)
        }

        if (intent === 'None') answers.push('Ik ben niet goed genoeg getrained om deze vraag te beantwoorden...')

        return {
            statusCode: 200,
            body: JSON.stringify({ 'result': { intent, answers }, 'statusCode': 200 })
        }
    }
    catch (e) {
        // throw new Error('Error fetching Google Analytics data')
        return {
            statusCode: 500,
            body: e.message
        }
    }
};