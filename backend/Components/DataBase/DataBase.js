const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('./AdminKey.json'); // Replace with your own service account key file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Replace with your Firebase database URL
});

// Get a Firestore reference
const db = admin.firestore();

// Function to save data to Firestore with a specific document ID
const saveDataWithCustomId = async (collectionName,documentId, data) => {
  try {
    // Set a document with a custom ID in a collection
    await db.collection(collectionName).doc(documentId).set(data);
    
    return true // Return the custom document ID
  } catch (error) {
    console.error('Error adding document: ', error);
    throw error; 
    return false// Throw the error for handling elsewhere, if needed
  }
};

// Example data to save

module.exports=db