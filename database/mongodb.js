const {MongoClient} = require('mongodb');
const {mongo_db} = require('../config.json')

const uri = `mongodb+srv://${mongo_db.user}:${mongo_db.password}@${mongo_db.host}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function getStripeAccount(tutorID){
    tutorID = parseInt(tutorID)

    try {
        await client.connect();
        const tutors = client.db('novicate').collection('tutors')

        const doc = await tutors.findOne({id: tutorID})

        if(doc == null) return null;

        return doc.stripeAccount;
    } finally {
        await client.close();
    }
}

// async function test(){
//     console.log(await getStripeAccount(2))
// }
// test()

module.exports = {getStripeAccount}
