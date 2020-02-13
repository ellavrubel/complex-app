
            const mongodb = require('mongodb');

            const connectionString = 'mongodb+srv://todoAppUser:rehnrkfq@firstapp-khioh.mongodb.net/complex-app?retryWrites=true&w=majority';

            mongodb.connect(connectionString, {useNewUrlparser: true, useUnifiedTopology: true}, function (err, client) {

                module.exports = client.db();
                const app = require('./app');
                app.listen(2000);

            });