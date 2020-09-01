const { NlpManager } = require("node-nlp");
const firebase = require("firebase/app");
require("firebase/database");
require("firebase/storage");

const fs = require('fs')

const firebaseConfig = {
    apiKey: `${process.env.apiKey}`,
    authDomain: `${process.env.id}.firebaseapp.com`,
    databaseURL: `https://${process.env.id}.firebaseio.com`,
    projectId: `${process.env.id}`,
    storageBucket: `${process.env.id}.appspot.com`,
    messagingSenderId: `${process.env.messagingSenderId}`,
    appId: `${process.env.appId}`
};

firebase.initializeApp(firebaseConfig);

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

exports.handler = async (event, context, callback) => {
    // const manager = new NlpManager();
    const manager = new NlpManager({ modelFileName: '/tmp/model.nlp' });
    // const manager = new NlpManager({ autoSave: false });

    // // use to read data from firebase
    const model = await firebase.database().ref('model').once('value').then(snap => {
        return snap.val()
    });

    

    // var storage = firebase.storage();
    // var gsReference = storage.refFromURL('gs://graduate-16c74.appspot.com/model.nlp');

    // gsReference.child('images/stars.jpg').getDownloadURL().then(function(url) {
    //     // `url` is the download URL for 'images/stars.jpg'
      
    //     // This can be downloaded directly:
    //     var xhr = new XMLHttpRequest();
    //     xhr.responseType = 'blob';
    //     xhr.onload = function(event) {
    //       var blob = xhr.response;
    //     };
    //     xhr.open('GET', url);
    //     xhr.send();
      
    //     // Or inserted into an <img> element:
    //     var img = document.getElementById('myimg');
    //     img.src = url;
    //   }).catch(function(error) {
    //     // Handle any errors
    //   });

    // const ref = firebase.storage().ref()

    // const storageRef = ref.child('/tmp/model.nlp')

    // var message = 'This is my message.';

    // storageRef.putString(message).then(function(snapshot) {
    //   console.log('Uploaded a raw string!');
    // });

    // fs.writeFile('/tmp/model.nlp', model, (err) => {
    //     if (err) {
    //         console.error(err)
    //         return
    //     }
    //     //file written successfully
    // })

    const nlp = {"settings":{"languages":["en"],"threshold":0.9,"tag":"nlp","autoLoad":true,"autoSave":true,"modelFileName":"model.nlp"},"nluManager":{"settings":{"tag":"nlu-manager"},"locales":["en"],"languageNames":{},"domainManagers":{"en":{"settings":{"locale":"en","tag":"domain-manager-en","nluByDomain":{"default":{"className":"NeuralNlu","settings":{}}},"trainByDomain":false,"useStemDict":true},"stemDict":{"a,can,espresso,get,i,pleas,tripl":{"intent":"Order","domain":"default"},"a,can,espresso,i,order,pleas,tripl":{"intent":"Order","domain":"default"},"a,espresso,give,me,tripl":{"intent":"Order","domain":"default"},"a,espresso,i,tripl,want":{"intent":"Order","domain":"default"},"espresso,one,pleas,tripl":{"intent":"Order","domain":"default"}},"intentDict":{"Order":"default"},"sentences":[{"domain":"default","utterance":"Can I get a triple espresso please?","intent":"Order"},{"domain":"default","utterance":"Can I order a triple espresso please?","intent":"Order"},{"domain":"default","utterance":"Give me a triple espresso.","intent":"Order"},{"domain":"default","utterance":"I want a triple espresso.","intent":"Order"},{"domain":"default","utterance":"One triple espresso please.","intent":"Order"}],"domains":{"master_domain":{"settings":{"locale":"en","tag":"nlu-en","keepStopwords":true,"nonefeatureValue":1,"nonedeltaMultiplier":1.2,"spellCheck":false,"spellCheckDistance":1,"filterZeros":true,"log":true},"features":{"can":1,"i":1,"get":1,"a":1,"tripl":1,"espresso":1,"pleas":1,"order":1,"give":1,"me":1,"want":1,"one":1},"intents":{"Order":1},"intentFeatures":{"Order":["can","i","get","a","tripl","espresso","pleas","order","give","me","want","one"]},"featuresToIntent":{"can":["Order"],"i":["Order"],"get":["Order"],"a":["Order"],"tripl":["Order"],"espresso":["Order"],"pleas":["Order"],"order":["Order"],"give":["Order"],"me":["Order"],"want":["Order"],"one":["Order"]},"neuralNetwork":{"features":["can","i","get","a","tripl","espresso","pleas","order","give","me","want","one","nonefeature"],"intents":["Order","None"],"perceptrons":[[-0.3508557081222534,0.7886922359466553,-0.20373843610286713,1.7552250623703003,3.7717080116271973,3.7717080116271973,1.6656265258789062,-0.14711704850196838,0.966533362865448,0.966533362865448,1.1395479440689087,2.016482353210449,-1.2345178127288818,1.2676496211012593],[-0.1555013209581375,-0.3723520040512085,-0.09569539874792099,-0.6700979471206665,-1.2093554735183716,-1.2093554735183716,-0.6947587132453918,-0.05980592593550682,-0.29774585366249084,-0.29774585366249084,-0.2168506681919098,-0.539257287979126,8.569230079650879,3.687453238598641]],"perceptronSettings":{"locale":"en","tag":"nlu-en","keepStopwords":true,"nonefeatureValue":1,"nonedeltaMultiplier":1.2,"spellCheck":false,"spellCheckDistance":1,"filterZeros":true,"log":true}}}}}},"intentDomains":{},"extraSentences":[["en","Can I get a triple espresso please?"],["en","Can I order a triple espresso please?"],["en","Give me a triple espresso."],["en","I want a triple espresso."],["en","One triple espresso please."]]},"ner":{"settings":{"tag":"ner","entityPreffix":"%","entitySuffix":"%"},"rules":{}},"nlgManager":{"settings":{"tag":"nlg-manager"},"responses":{}},"actionManager":{"settings":{"tag":"action-manager"},"actions":{}},"slotManager":{}}


    firebase.database().ref('model').set(JSON.stringify(nlp));



    // console.log({nlp});
    // console.log({model});
    // const stringify = JSON.stringify(model)

    const parse = JSON.parse(model)

    console.log({parse});
   
    // fs.writeFileSync('/tmp/model.nlp', nlp)

    // console.log({ model });
    manager.import(parse);

    // manager.addDocument("en", "Can I get a triple espresso please?", "Order");
    // manager.addDocument("en", "Can I order a triple espresso please?", "Order");
    // manager.addDocument("en", "Give me a triple espresso.", "Order");
    // manager.addDocument("en", "I want a triple espresso.", "Order");
    // manager.addDocument("en", "One triple espresso please.", "Order");

    // manager.train()

    const minified = true
    // const data = await manager.save('/tmp/model.nlp');
    const data = await manager.export(!minified);

    //    const data = fs.readFileSync('/tmp/model.nlp', 'utf8')
      

    //   console.log({data});

      callback(null, {
          statusCode: 200,
          body: data,
      });

};