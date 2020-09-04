const { NlpManager } = require("node-nlp");
const { google } = require('googleapis')
const axios = require('axios')


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

    try {

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

        const headers = { Authorization: 'Bearer ' + token }

        // const { data } = await axios.get(apiUrl, { headers })

        // NLP manager

        const logfn = (status, time) => console.log(status, time);
        // const manager = new NlpManager({ autoSave: false, languages: ["en"], nlu: { log: logfn } });
        const manager = new NlpManager({ autoSave: false, languages: ["en"] });

        // parse the data from the database
        // const parsedModel = JSON.parse(data)

        manager.addDocument('en', 'goodbye for now', 'greetings.bye');
        manager.addDocument('en', 'bye bye take care', 'greetings.bye');
        manager.addDocument('en', 'okay see you later', 'greetings.bye');
        manager.addDocument('en', 'bye for now', 'greetings.bye');
        manager.addDocument('en', 'i must go', 'greetings.bye');
        manager.addDocument('en', 'hello', 'greetings.hello');
        manager.addDocument('en', 'hi', 'greetings.hello');
        manager.addDocument('en', 'howdy', 'greetings.hello');

        // Train also the NLG
        manager.addAnswer('en', 'greetings.bye', 'Till next time');
        manager.addAnswer('en', 'greetings.bye', 'see you soon!');
        manager.addAnswer('en', 'greetings.hello', 'Hey there!');
        manager.addAnswer('en', 'greetings.hello', 'Greetings!');

        // train the AI / manager
        manager.train()

        // export the minified manager to json (already stringified)
        const minified = true
        const output = await manager.export(minified);
        manager.save();

        const response = await manager.process('en', "okay see you later");
        console.log(response);
        // console.log({ output });

        const stringified = JSON.stringify(output)

        // const sendToDb = await axios.put(apiUrl, stringified)

        return {
            statusCode: 200,
            body: '',
        }
        // return the data
    } catch (e) {
        // throw new Error('Error fetching Google Analytics data')
        return {
            statusCode: 500,
            body: e.message
        }
    }
};