// // Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDGOBf5W7oLezw3ZNQup2YWr480SmxG30g",
  authDomain: "graduate-16c74.firebaseapp.com",
  databaseURL: "https://graduate-16c74.firebaseio.com",
  projectId: "graduate-16c74",
  storageBucket: "graduate-16c74.appspot.com",
  messagingSenderId: "485788019711",
  appId: "1:485788019711:web:766682be75a5fb273b95ca"
};
// var firebaseConfig = {
//   apiKey: `${process.env.apiKey}`,
//   authDomain: `${process.env.id}.firebaseapp.com`,
//   databaseURL: `https://${process.env.id}.firebaseio.com`,
//   projectId: `${process.env.id}`,
//   storageBucket: `${process.env.id}.appspot.com`,
//   messagingSenderId: `${process.env.messagingSenderId}`,
//   appId: `${process.env.appId}`
// };
// Initialize Firebase with a "default" Firebase project
var defaultProject = firebase.initializeApp(firebaseConfig);

// Option 1: Access Firebase services via the defaultProject variable
var defaultDatabase = defaultProject.database();
var auth = defaultProject.auth();

