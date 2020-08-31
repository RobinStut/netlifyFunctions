const { NlpManager } = require("node-nlp");
const manager = new NlpManager({ languages: ["en"], threshold: 0.90 });

// // I suggest you train each intent with about 10 input examples.
// manager.addDocument("en", "Can I get a triple espresso please?", "Order");
// manager.addDocument("en", "Can I order a triple espresso please?", "Order");
// manager.addDocument("en", "Give me a triple espresso.", "Order");
// manager.addDocument("en", "I want a triple espresso.", "Order");
// manager.addDocument("en", "One triple espresso please.", "Order");
// // etc

exports.handler = async function (event, context, callback) {
    await manager.train();
    const minified = true
    const data = manager.export(!minified);

    callback(null, {
        statusCode: 200,
        body: data,
    });
};