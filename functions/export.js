const { NlpManager } = require("node-nlp");
// const firebase = require("firebase/app");
// require("firebase/database");

// const firebaseConfig = {
//     apiKey: `${process.env.apiKey}`,
//     authDomain: `${process.env.id}.firebaseapp.com`,
//     databaseURL: `https://${process.env.id}.firebaseio.com`,
//     projectId: `${process.env.id}`,
//     storageBucket: `${process.env.id}.appspot.com`,
//     messagingSenderId: `${process.env.messagingSenderId}`,
//     appId: `${process.env.appId}`
// };

// if (!firebase.apps.length) {
//     firebase.initializeApp(firebaseConfig);
// }



const { google } = require('googleapis')
const axios = require('axios')
// const dotenv = require('dotenv')
// dotenv.config()

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

    //     // NLP manager
    //     const manager = new NlpManager({ autoSave: false });

    //     // get the current nlp model from the database
    //     const model = await firebase.database().ref('model').once('value').then(snap => {
    //         return snap.val()
    //     });

    //     // parse the data from the database
    //     const parsedModel = JSON.parse(model)

    //     // import the parsed model
    //     manager.import(parsedModel);

    //     // add sentences to the manager for training
    //     manager.addDocument("en", "Can I get a triple espresso please?", "Order");
    //     manager.addDocument("en", "Can I order a triple espresso please?", "Order");
    //     manager.addDocument("en", "Give me a triple espresso.", "Order");
    //     manager.addDocument("en", "I want a triple espresso.", "Order");
    //     manager.addDocument("en", "One triple espresso please.", "Order");

    //     // train the AI / manager
    //     manager.train()

    //     const minified = true

    //     // export the minified manager to json (already stringified)
    //     const data = await manager.export(minified);

    //     // upload the new nlp model to the database
    //     firebase.database().ref('model').set(data);


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

        const {data} = await axios.get(apiUrl, { headers })

        // NLP manager
        const manager = new NlpManager({ autoSave: false });

    //     // get the current nlp model from the database
    //     const model = await firebase.database().ref('model').once('value').then(snap => {
    //         return snap.val()
    //     });

    //     // parse the data from the database
    //     const parsedModel = JSON.parse(model)

    //     // import the parsed model
        manager.import(data);


        // add sentences to the manager for training
        manager.addDocument("en", "Can I get a triple espresso please?", "Order");
        manager.addDocument("en", "Can I order a triple espresso please?", "Order");
        manager.addDocument("en", "Give me a triple espresso.", "Order");
        manager.addDocument("en", "I want a triple espresso.", "Order");
        manager.addDocument("en", "One triple espresso please.", "Order");

        // train the AI / manager
        manager.train()

        const minified = true

        // export the minified manager to json (already stringified)
        const output = await manager.export(minified);

        console.log({output});

        const stringified = JSON.stringify(output)

        console.log({stringified});
        // const {data} = await axios.get(apiUrl, { headers })
        const sendToDb = await axios.put(apiUrl, stringified)



        // axios interceptors
        // axios .request . response

        // return data

        return {
            statusCode: 200,
            body: data,
        }
        // return the data
    } catch (e) {
        // throw new Error('Error fetching Google Analytics data')
        return {
            statusCode: 500,
            body: e.message
        }
    }
    
    // callback(null, {
    //     statusCode: 200,
    //     body: data,
    // });


};