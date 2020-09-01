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

const base = firebase.initializeApp(firebaseConfig);
const db = base.database();

const testData = {
    "settings": {
        "languages": [
            "en"
        ],
        "threshold": 0.9,
        "tag": "nlp",
        "autoLoad": true,
        "autoSave": true,
        "modelFileName": "model.nlp",
        "calculateSentiment": true
    },
    "nluManager": {
        "settings": {
            "tag": "nlu-manager"
        },
        "locales": [
            "en"
        ],
        "languageNames": {},
        "domainManagers": {
            "en": {
                "settings": {
                    "locale": "en",
                    "tag": "domain-manager-en",
                    "nluByDomain": {
                        "default": {
                            "className": "NeuralNlu",
                            "settings": {}
                        }
                    },
                    "trainByDomain": false,
                    "useStemDict": true
                },
                "stemDict": {},
                "intentDict": {},
                "sentences": [],
                "domains": {
                    "master_domain": {
                        "settings": {
                            "locale": "en",
                            "tag": "nlu-en",
                            "keepStopwords": true,
                            "nonefeatureValue": 1,
                            "nonedeltaMultiplier": 1.2,
                            "spellCheck": false,
                            "spellCheckDistance": 1,
                            "filterZeros": true,
                            "log": true
                        }
                    }
                }
            }
        },
        "intentDomains": {},
        "extraSentences": []
    },
    "ner": {
        "settings": {
            "tag": "ner",
            "entityPreffix": "%",
            "entitySuffix": "%"
        },
        "rules": {}
    },
    "nlgManager": {
        "settings": {
            "tag": "nlg-manager"
        },
        "responses": {}
    },
    "actionManager": {
        "settings": {
            "tag": "action-manager"
        },
        "actions": {}
    },
    "slotManager": {}
}

exports.handler = async function (event, context, callback) {
    // const manager = new NlpManager();
    // const manager = new NlpManager({ modelFileName: '/tmp/model.nlp' });
    const manager = new NlpManager({ autoSave: false });

    // use to read data from firebase
    db.ref('model').on('value', async (snap) => {
        console.log(snap.val());
        console.log('it works');
        // manager.import(snap.val());
    })

    manager.import(testData);

    manager.addDocument("en", "Can I get a triple espresso please?", "Order");
    manager.addDocument("en", "Can I order a triple espresso please?", "Order");
    manager.addDocument("en", "Give me a triple espresso.", "Order");
    manager.addDocument("en", "I want a triple espresso.", "Order");
    manager.addDocument("en", "One triple espresso please.", "Order");

    manager.train()

    const minified = true
    const data = await manager.export(!minified);

    callback(null, {
        statusCode: 200,
        body: data,
    });
};