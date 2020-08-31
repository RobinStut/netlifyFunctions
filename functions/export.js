const { NlpManager } = require("node-nlp");
// const manager = new NlpManager({ languages: ["en"], threshold: 0.90 });

// // I suggest you train each intent with about 10 input examples.
// manager.addDocument("en", "Can I get a triple espresso please?", "Order");
// manager.addDocument("en", "Can I order a triple espresso please?", "Order");
// manager.addDocument("en", "Give me a triple espresso.", "Order");
// manager.addDocument("en", "I want a triple espresso.", "Order");
// manager.addDocument("en", "One triple espresso please.", "Order");
// // etc

exports.handler = async function (event, context, callback) {
    // await manager.train();
    const minified = true

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

    const manager = new NlpManager();
    manager.import(testData);


    manager.addDocument("en", "Can I get a triple espresso please?", "Order");
    manager.addDocument("en", "Can I order a triple espresso please?", "Order");
    manager.addDocument("en", "Give me a triple espresso.", "Order");
    manager.addDocument("en", "I want a triple espresso.", "Order");
    manager.addDocument("en", "One triple espresso please.", "Order");

    // manager.train()

    const data = await manager.export(!minified);

    callback(null, {
        statusCode: 200,
        body: data,
    });
};