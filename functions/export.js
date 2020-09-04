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
        nlp.import(data);

        nlp.addLanguage('nl');

        // What should I do if I forget to fill in the discountcode?

        nlp.addDocument('nl', `kortingscode vergeten`, 'kortingen.vergeten');
        nlp.addDocument('nl', `korting niet ingevuld`, 'kortingen.vergeten');
        nlp.addDocument('nl', `kortingscode niet ingevuld`, 'kortingen.vergeten');
        nlp.addDocument('nl', `Wat moet ik doen als ik de kortingscode vergeten ben in te vullen?`, 'kortingen.vergeten');
        nlp.addDocument('nl', `Wat moet ik doen als ik de kortingscode vergeet in te voeren?`, 'kortingen.vergeten');
        nlp.addDocument('nl', `ik ben de korting vergeten in te voeren?`, 'kortingen.vergeten');
        nlp.addDocument('nl', `ik ben de kortingscode niet ingevuld`, 'kortingen.vergeten');
        nlp.addDocument('nl', `ik ben vergeten de korting in te vullen`, 'kortingen.vergeten');
        nlp.addDocument('nl', `ik heb de kortingscode niet ingevuld`, 'kortingen.vergeten');
        
        nlp.addAnswer('nl', 'kortingen.vergeten', `Stuur ons een bericht zodra je jouw bestelling hebt ontvangen en hebt besloten of je de item(s) wilt houden. Stuur je items retour? Stuur ons dan een bericht zodra jouw retour is verwerkt en terugbetaald. Mocht de korting geldig zijn op jouw bestelling, dan zullen wij de korting achteraf voor je verwerken. (Let op! Dit is niet geldig op persoonlijke kortingen.)`);  
        
        // What should I do if the discount code doesn't work?
        
        nlp.addDocument('nl', `Hoe gebruik ik mijn kortingscode of cadeaubon?`, 'kortingen.gebruiken');
        nlp.addDocument('nl', `Hoe kan ik mijn cadeaubon verzilveren?`, 'kortingen.gebruiken');
        nlp.addDocument('nl', `Hoe gebruik ik mijn kortingscode?`, 'kortingen.gebruiken');
        nlp.addDocument('nl', `ik wil mijn cadeaubon gebruiken?`, 'kortingen.gebruiken');
        nlp.addDocument('nl', `waar kan ik mijn kortingscode invullen?`, 'kortingen.gebruiken');
        nlp.addDocument('nl', `Hoe lever ik mijn cadeaubon in?`, 'kortingen.gebruiken');
        nlp.addDocument('nl', `Hoe lever ik mijn kortingscode in?`, 'kortingen.gebruiken');
        nlp.addDocument('nl', `Wat kan ik met een cadeaubon of kortingscode?`, 'kortingen.gebruiken');
        
        nlp.addAnswer('nl', 'kortingen.gebruiken', `Dit kan verschillende oorzaken hebben. Denk hierbij aan de volgende punten: 
        
        - Voor sommige kortingscodes heb je een account nodig. 
        - De meeste kortingscodes hebben bepaalde voorwaarden het kan zijn dat jouw bestelling niet aan de voorwaarden voldoet. 
        - Kortingscodes zijn niet geldig op SALE artikelen.
        - Let goed op tot wanneer de kortingscode geldig is. 
        
        Mocht het niet aan de bovenstaande punten liggen dan raden wij je aan om de bestelling alsnog te plaatsen. Stuur ons een bericht zodra je jouw bestelling hebt ontvangen en hebt besloten of je de item(s) wilt houden. Stuur je items retour? Stuur ons dan een bericht zodra jouw retour is verwerkt en terugbetaald. Wij zullen de korting dan alsnog achteraf voor je verwerken.`);  
        
        // Am I entitled to a discount if there is a sale after I placed my order? 
        
        nlp.addDocument('nl', `De items zijn afgeprijsd na het plaatsen van mijn bestelling, heb ik recht op korting?`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `Het product is afgeprijsd na het de bestelling, kan ik genieten van de korting?`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `Na het plaatsen van een bestelling krijgt het product korting, mag ik dan ook die korting?`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `Het eerder gekochte product is nu in de sale, kan ik ook deze korting krijgen?`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `Ik heb iets gekocht wat nu in de sale is, kan ik dit verschil terug krijgen?`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `Een paar items die ik gekocht heb zijn nu afgeprijst, kan ik hier geld voor terug krijgen?`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `Items die ik gekocht heb zijn nu te koop met korting`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `Ik heb producten besteld die nu in de sale zijn, wat nu?`, 'kortingen.postBestelling');
        nlp.addDocument('nl', `eerder gekochte producten zijn nu met korting`, 'kortingen.postBestelling');

        nlp.addAnswer('nl', 'kortingen.postBestelling', `Als de SALE binnen 48 uur gestart is na het plaatsen van je bestelling, vergoeden wij het verschil van de bedragen van de items die je houdt door middel van een LOAVIES Giftcard.

        Stuur ons een bericht zodra je jouw bestelling hebt ontvangen en hebt besloten of je de item(s) wilt houden. Stuur je items retour? Stuur ons dan een bericht zodra jouw retour is verwerkt en terugbetaald. Je ontvangt dan een Giftcard ter waarde van het verschil van de kortingsbedragen van de items.`);  


        await nlp.train()

        const result = await nlp.process("Ik heb een product gekocht, en die is nu met korting")

        console.log({ result });

        const minified = true

        // export the minified manager to json
        const output = await nlp.export(minified);

        // stringify the output of the manager
        const stringified = JSON.stringify(output)

        // upload stringified items to firebase
        const sendToDb = await axios.put(apiUrl, stringified)

        // return the data
        return {
            statusCode: 200,
            body: `<pre><code>${JSON.stringify(result.intent)}</code></pre>`,
        }
    } catch (e) {
        // throw new Error('Error fetching Google Analytics data')
        return {
            statusCode: 500,
            body: e.message
        }
    }
};