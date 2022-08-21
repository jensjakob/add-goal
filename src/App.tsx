import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import "./App.css";
import LoginButton from "./components/LoginButton";

// import styles from "./App.module.css";

const firebaseConfig = {
  apiKey: "AIzaSyDAg5RUuTd5oq5inNHkRAYOjralOn_SK2Q",
  authDomain: "add-goal-app.firebaseapp.com",
  projectId: "add-goal-app",
  storageBucket: "add-goal-app.appspot.com",
  messagingSenderId: "673617995128",
  appId: "1:673617995128:web:df1012a43d0ca65482d48d",
};

interface Goal {
  id: string;
  name: string;
  label: string;
  sum?: number;
}

let user = "39Z2Nsdjj4Vh8xvg9cJr";

function App() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [goals, setGoals] = useState<Goal[] | null>(null);

  async function handleUp(docId: string, sum: number = 0) {
    const docRef = doc(db, "users", `${user}/goals/${docId}`);

    await updateDoc(docRef, {
      sum: sum + 1,
    });
  }

  async function handleDown(docId: string, sum: number = 0) {
    const docRef = doc(db, "users", `${user}/goals/${docId}`);

    await updateDoc(docRef, {
      sum: sum - 1,
    });
  }

  async function handleClick() {
    let defaultGoals = [
      "Happiness",
      "Money",
      "Save the world",
      "Cleanness",
      "Social",
      "Health",
      "Food",
      "Projects",
      "Knowledge",
      "Security",
      "Todos",
      "Progress",
      "Growth",
      "Career",
      "Nature",
      "Home",
    ];

    defaultGoals.forEach(async (goal) => {
      // Stop if goal exist
      if (goals?.find((g) => g.label === goal)) {
        return;
      }

      // Replace spaces with underscores
      let name = goal.replace(/\s/g, "_").toLowerCase();

      try {
        await addDoc(collection(db, `users/${user}/goals`), {
          name: name,
          label: goal,
        });
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    });
  }

  useEffect(() => {
    const collectionRef = collection(db, "users", `${user}/goals`);
    const q = query(collectionRef);

    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          name: doc.data().name,
          label: doc.data().label,
          sum: doc.data().sum,
        };
      });

      setGoals(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <h1>Goals</h1>
      <ul>
        {goals?.map((goal) => (
          <li key={goal.id}>
            {goal.label}{" "}
            <button onClick={() => handleDown(goal.id, goal.sum)}>👎</button>{" "}
            {goal?.sum}{" "}
            <button onClick={() => handleUp(goal.id, goal.sum)}>👍</button>
          </li>
        ))}
      </ul>
      <button onClick={handleClick}>Add all default goals</button>
      <LoginButton />
    </div>
  );
}

export default App;
