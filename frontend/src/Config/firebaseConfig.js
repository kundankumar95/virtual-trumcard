import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCiA367o-NH6s2a0vdquiEcD_9DEvhuP-E",
  authDomain: "beingsarangi.firebaseapp.com",
  projectId: "beingsarangi",
  storageBucket: "beingsarangi.appspot.com",
  messagingSenderId: "796175597816",
  appId: "1:796175597816:web:880a3afa7b412b2a03bb0d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };

