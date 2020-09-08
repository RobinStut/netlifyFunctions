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
        const { data: nlpModel = data } = await axios.get(modelUrl, { headers })
        const trainingHistory = await axios.get(trainingHistoryUrl, { headers })
        console.log(trainingHistory);

        // NLP manager
        const dock = await dockStart({ use: ['Basic'], autoSave: false });

        // // Setup NLP
        const nlp = dock.get('nlp');

        // // Import data
        // nlp.import(nlpModel);
        // // // nlp.load();

        // nlp.addLanguage('nl');

        // 2.   ontvang nieuwe input voor het model. (vragen en antwoorden)

        // const combinedTrainingUri = `${trainingUrl}${trainingId}.json`
        // const { data: trainingData = data } = await axios.get(combinedTrainingUri, { headers })



        // for (const [key, value] of Object.entries(trainingData)) {
        //     value.forEach(input => {
        //         const { language, intent, utterance } = input
        //         const valueIsAlreadyInModel = JSON.stringify(nlpModel).includes(utterance)
        //         const chatbotOutput = key === 'chatbotReactionTrainingForm'
        //         const userOrChatbot = chatbotOutput ? 'Chatbot reactie' : 'Gebruikers input'

        //         // 3.1  Zo ja, return error melding, value already exist
        //         if (valueIsAlreadyInModel) {
        //             console.log('already added');
        //             const message = `Deze trainingdata is al toegevoegd: ${userOrChatbot} ${input}`
        //             return {
        //                 statusCode: 500,
        //                 body: message
        //             }
        //         }

        //         // 3.2  Zo nee, train model
        //         if (chatbotOutput) {
        //             nlp.addAnswer(language, intent, utterance);

        //         }
        //         else {
        //             nlp.addDocument(language, utterance, intent);
        //         }
        //     });
        // }

        // await nlp.train()

        // // export the minified manager to json
        // const minified = true
        // const output = await nlp.export(minified);

        // // stringify the output of the manager
        // const stringified = JSON.stringify(output)

        // // 4.   sla model op in database
        // // upload stringified items to firebase
        // await axios.put(modelUrl, stringified)

        return {
            statusCode: 200,
            body: JSON.stringify({ 'status': 'Training voltooid', 'statusCode': 200 })
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