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
import mixpanel from "mixpanel-browser";

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

// Enabling the debug mode flag is useful during implementation,
// but it's recommended you remove it for production
mixpanel.init("424af2fd1c1c4e8504092eac6eab65b0", {
  api_host: "https://api-eu.mixpanel.com",
  property_blacklist: [
    "$browser",
    "$browser_version",
    "$initial_referrer",
    "$initial_referring_domain",
    "$lib_version",
    "$os",
    "$screen_height",
    "$screen_width",
    "mp_lib",
  ],
  ip: false,
  debug: true,
});
mixpanel.track("init");

interface IGoal {
  id: string;
  name: string;
  label: string;
  sum?: number;
}

interface IEvent {
  goal: string;
  name: string;
  timestamp: Date;
}

let user = "39Z2Nsdjj4Vh8xvg9cJr";

function App() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [goals, setGoals] = useState<IGoal[] | null>(null);

  // if (!("Notification" in window)) {
  //   console.log("This browser does not support desktop notification");
  // } else {
  //   console.log("notifications", Notification.permission);

  //   Notification.requestPermission();
  // }

  async function addEvent(name: string, goal: string) {
    try {
      const data: IEvent = {
        goal,
        name,
        timestamp: new Date(),
      };
      await addDoc(collection(db, `users/${user}/events`), data);
      // console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async function updateSum(docId: string, sum: number) {
    const docRef = doc(db, "users", `${user}/goals/${docId}`);

    await updateDoc(docRef, {
      sum: sum,
    });
  }

  async function handleUp(docId: string, sum: number = 0) {
    const docRef = doc(db, "users", `${user}/goals/${docId}`);

    await updateDoc(docRef, {
      sum: sum + 1,
    });

    addEvent("up", docId);
    mixpanel.track("like");
  }

  async function handleDown(docId: string, sum: number = 0) {
    const docRef = doc(db, "users", `${user}/goals/${docId}`);

    await updateDoc(docRef, {
      sum: sum - 1,
    });

    addEvent("down", docId);
  }

  // async function handleDelete(docId: string) {
  //   await deleteDoc(doc(db, `users/${user}/goals`, docId));
  //   // Events is not deleted
  // }

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

    const collectionRefEvents = collection(db, "users", `${user}/events`);
    const qEvents = query(collectionRefEvents);

    onSnapshot(qEvents, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        return {
          id: doc.id,
          goal: doc.data().goal,
          name: doc.data().name,
          timestamp: doc.data().timestamp,
        };
      });

      data.sort((a, b) => (a.goal > b.goal ? 1 : -1));

      let goalSum = 0;
      data.forEach((item, index) => {
        goalSum += item.name === "up" ? 1 : -1;

        if (data[index + 1]?.goal !== item.goal) {
          // Save the data
          updateSum(item.goal, goalSum);
          console.log("log:", item.goal, goalSum);

          // Reset
          goalSum = 0;
        }
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <LoginButton />
      <h1>Goals</h1>
      <button
        onClick={() => {
          console.log("click");

          setTimeout(() => {
            console.log("visi", document.visibilityState);
            if (document.visibilityState === "hidden") {
              const notis = new Notification("Hur mår du?");
              console.log("sent");

              // setTimeout(() => {
              //   notis.close();
              // }, 10 * 1000);

              // window.onfocus = () => notis.close();
              document.addEventListener("visibilitychange", () =>
                notis.close()
              );
            }
          }, 3 * 1000);
        }}
      >
        Dagens fråga
      </button>
      <ul>
        {goals?.map((goal) => (
          <li key={goal.id}>
            {goal.label}{" "}
            <button onClick={() => handleDown(goal.id, goal.sum)}>👎</button>{" "}
            {goal?.sum}{" "}
            <button onClick={() => handleUp(goal.id, goal.sum)}>👍</button>
            {/* <button onClick={() => handleDelete(goal.id)}>Delete</button> */}
          </li>
        ))}
      </ul>
      <button onClick={handleClick}>Add all default goals</button>
    </div>
  );
}

export default App;
