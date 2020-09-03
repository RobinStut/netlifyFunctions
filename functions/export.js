// const { NlpManager } = require("node-nlp");
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
        // nlp.import(data);



        nlp.addNamedEntityText("size", "grande", ["en"], ["Grande", "Large", "Triple"]);
        nlp.addNamedEntityText("size", "short", ["en"], ["Short", "Small", "Single"]);
        nlp.addNamedEntityText("size", "tall", ["en"], ["Tall", "Medium", "Double"]);

        nlp.addNamedEntityText("drink", "americano", ["en"], ["Americano", "Americanos"]);
        nlp.addNamedEntityText("drink", "latte", ["en"], ["Latte", "Lattes"]);
        nlp.addNamedEntityText("drink", "cappuccino", ["en"], ["Cappuccino", "Cappuccinos"]);

        nlp.addDocument("en", "Can I get a %size% %drink% please?", "Order");
        nlp.addDocument("en", "Can I order a %size% %drink% please?", "Order");
        nlp.addDocument("en", "Give me a %size% %drink%.", "Order");
        nlp.addDocument("en", "I want a %size% %drink%.", "Order");
        nlp.addDocument("en", "One %size% %drink% please.", "Order");


        // nlp.addLanguage('en');
        // // Adds the utterances and intents for the NLP
        // nlp.addDocument('en', 'goodbye for now', 'greetings.bye');
        // nlp.addDocument('en', 'bye bye take care', 'greetings.bye');
        // nlp.addDocument('en', 'okay see you later', 'greetings.bye');
        // nlp.addDocument('en', 'bye for now', 'greetings.bye');
        // nlp.addDocument('en', 'i must go', 'greetings.bye');
        // nlp.addDocument('en', 'hello', 'greetings.hello');
        // nlp.addDocument('en', 'hi', 'greetings.hello');
        // nlp.addDocument('en', 'howdy', 'greetings.hello');

        // // Train also the NLG
        // nlp.addAnswer('en', 'greetings.bye', 'Till next time');
        // nlp.addAnswer('en', 'greetings.bye', 'see you soon!');
        // nlp.addAnswer('en', 'greetings.hello', 'Hey there!');
        // nlp.addAnswer('en', 'greetings.hello', 'Greetings!');

        await nlp.train()

        const result = nlp.process("Hi, I'd like one triple espresso, please.")

        console.log({ result });

        const minified = true

        // export the minified manager to json
        const output = await nlp.export(minified);

        // console.log(output);

        // stringify the output of the manager
        const stringified = JSON.stringify(output)

        // upload stringified items to firebase
        const sendToDb = await axios.put(apiUrl, stringified)

        // return the data
        return {
            statusCode: 200,
            body: '',
        }
    } catch (e) {
        // throw new Error('Error fetching Google Analytics data')
        return {
            statusCode: 500,
            body: e.message
        }
    }
};