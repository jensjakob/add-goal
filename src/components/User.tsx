import { useContext, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { MyContext } from "./../context/MyContext";

const firebaseConfig = {
  apiKey: "AIzaSyDAg5RUuTd5oq5inNHkRAYOjralOn_SK2Q",
  authDomain: "add-goal-app.firebaseapp.com",
  projectId: "add-goal-app",
  storageBucket: "add-goal-app.appspot.com",
  messagingSenderId: "673617995128",
  appId: "1:673617995128:web:df1012a43d0ca65482d48d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const User = () => {
  const inputRefEmail = useRef<HTMLInputElement>(null);
  const inputRefPassword = useRef<HTMLInputElement>(null);

  const { setState } = useContext(MyContext);

  function onLogin(userId: string) {
    if (setState) {
      setState({ user: userId });
      sessionStorage.setItem("state", JSON.stringify({ user: userId }));
    }
  }

  async function login(event: { preventDefault: () => void }) {
    event.preventDefault();

    const email = inputRefEmail.current!.value;
    const password = inputRefPassword.current!.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        onLogin(userCredential.user.uid);
        console.log(userCredential.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);
      });
  }

  async function createUser() {
    const email = inputRefEmail.current!.value;
    const password = inputRefPassword.current!.value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        onLogin(userCredential.user.uid);
        console.log(userCredential.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);
      });
  }

  return (
    <div>
      <form>
        <input
          type="email"
          name="email"
          ref={inputRefEmail}
          autoComplete="email"
        />
        <input
          type="password"
          name="password"
          ref={inputRefPassword}
          autoComplete="current-password"
        />
        <button type="submit" onClick={login}>
          Login
        </button>
        <button type="button" onClick={createUser}>
          Create user
        </button>
      </form>
    </div>
  );
};

export default User;
