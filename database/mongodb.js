const {MongoClient} = require('mongodb');
const {mongo_db} = require('../config.json')

// MongoDB Connection String
const uri = `mongodb+srv://${mongo_db.user}:${mongo_db.password}@${mongo_db.host}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

/**
 * Retrieves a Stripe Account ID with a tutor ID.
 *
 * @param {int} tutorID The ID of the tutor as stored on SimplyBook.
 * @return {string} The Stripe Account ID linked to the tutor if found. Null if not found.
 */
async function getStripeAccount(tutorID){
    tutorID = parseInt(tutorID)

    try {
        // Open a connection to the MongoDB Database.
        await client.connect();

        // Obtain the collection Tutors.
        const tutors = client.db('novicate').collection('tutors')

        // Find a document which matches the ID provided.
        const doc = await tutors.findOne({id: tutorID})

        // Return the document if found.
        if(doc != null) return doc.stripeAccount;
        // Null if not found.
        return null;

    } finally {
        // Close the connection once it's finished.
        await client.close();
    }
}

module.exports = {getStripeAccount}
