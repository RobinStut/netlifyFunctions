// const { NlpManager } = require("node-nlp");
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

// exports.handler = async (event, context, callback) => {

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

//     const userInput = "Hi, I'd like one triple espresso, please.";
//     const response = await manager.process(userInput);

//     console.log(response);

//     // return the data
//     callback(null, {
//         statusCode: 200,
//         body: 'test',
//     });

// };