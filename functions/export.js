const { NlpManager } = require("node-nlp");
const firebase = require("firebase/app");
require("firebase/database");

const firebaseConfig = {
    apiKey: `${process.env.apiKey}`,
    authDomain: `${process.env.id}.firebaseapp.com`,
    databaseURL: `https://${process.env.id}.firebaseio.com`,
    projectId: `${process.env.id}`,
    storageBucket: `${process.env.id}.appspot.com`,
    messagingSenderId: `${process.env.messagingSenderId}`,
    appId: `${process.env.appId}`
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

exports.handler = async (event, context, callback) => {

    // NLP manager
    const manager = new NlpManager({ autoSave: false });

    // get the current nlp model from the database
    const model = await firebase.database().ref('model').once('value').then(snap => {
        return snap.val()
    });

    // parse the data from the database
    const parsedModel = JSON.parse(model)

    // import the parsed model
    manager.import(parsedModel);

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
    const data = await manager.export(minified);

    // upload the new nlp model to the database
    firebase.database().ref('model').set(data);

    // return the data
    callback(null, {
        statusCode: 200,
        body: data,
    });

};