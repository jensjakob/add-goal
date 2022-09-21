import { useContext, useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  fetchAndActivate,
  getRemoteConfig,
  getValue,
} from "firebase/remote-config";
import { getAnalytics, logEvent } from "firebase/analytics";

import "./App.css";
import LoginButton from "./components/LoginButton";
import { MyContext } from "./context/MyContext";
import Graph from "./components/Graph";

// import styles from "./App.module.css";

// Date as Year Month Day (YMD) string in the format of "yyyy-MM-dd"
function ymd(date: Date | undefined) {
  if (!date) return "";

  return (
    date.toLocaleDateString("sv-SE") + " " + date.toLocaleTimeString("sv-SE")
  );
}

// https://bobbyhadz.com/blog/javascript-date-add-hours
function addHours(numOfHours: number, date = new Date()) {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);

  return date;
}

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

interface IGoal {
  id: string;
  name: string;
  label: string;
  sum?: number;
  last_updated?: Date;
  raw_date: any;
}

interface IEvent {
  goal: string;
  name: string;
  timestamp: Date;
}

interface IGraphData {
  goal: string;
  label: Date;
  value: number;
}

// let user = "39Z2Nsdjj4Vh8xvg9cJr";

const App = () => {
  const { state } = useContext(MyContext);

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const analytics = getAnalytics(app);
  const remoteConfig = getRemoteConfig(app);

  const inputRefNewGoal = useRef<HTMLInputElement>(null);

  remoteConfig.defaultConfig = {
    positive_emoji: "👍",
  };

  const abPositiveEmoji: string = getValue(
    remoteConfig,
    "positive_emoji"
  ).asString();

  fetchAndActivate(remoteConfig)
    .then(() => {
      // ...
    })
    .catch((err) => {
      // ...
    });

  const [goals, setGoals] = useState<IGoal[] | null>(null);
  // const [events, setEvents] = useState<IEvent[] | null>(null);
  const [graphData, setGraphData] = useState<IGraphData[] | null>(null);
  const [sorting, setSorting] = useState<Array<string>>([]);

  let user: string | null = null;

  if (state?.user) {
    user = state.user;
  }

  async function addEvent(name: string, goal: string) {
    try {
      const data: IEvent = {
        goal,
        name,
        timestamp: new Date(), //TODO: Change to serverTimestamp?
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
      last_updated: serverTimestamp(),
    });

    addEvent("up", docId);
    logEvent(analytics, "like");
    console.debug("like");
  }

  async function handleDown(docId: string, sum: number = 0) {
    const docRef = doc(db, "users", `${user}/goals/${docId}`);

    await updateDoc(docRef, {
      sum: sum - 1,
      last_updated: serverTimestamp(),
    });

    addEvent("down", docId);
  }

  function handleSorting() {
    console.log(sorting);
  }
  // async function handleDelete(docId: string) {
  //   await deleteDoc(doc(db, `users/${user}/goals`, docId));
  //   // Events is not deleted
  // }

  async function handleClick() {
    let newGoals = [
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
      "Strength",
    ];

    if (!!inputRefNewGoal.current?.value) {
      newGoals = [inputRefNewGoal.current.value];
      inputRefNewGoal.current.value = "";
    }

    newGoals.forEach(async (goal) => {
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

  // const accumulate = array => array.map((sum => value => sum += value)(0));

  function oneGraph(goal: string) {
    return graphData
      ?.filter((event) => event.goal === goal)
      .map((event) => ({ label: event.label, value: event.value }));
  }

  useEffect(() => {
    if (state?.user) {
      const collectionRef = collection(db, "users", `${user}/goals`);
      const q = query(collectionRef);

      onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            name: doc.data().name,
            label: doc.data().label,
            sum: doc.data().sum,
            last_updated: doc.data().last_updated?.toDate(),
            raw_date: doc.data().last_updated,
          };
        });

        //TODO: Add popularity and last action and show popular but not updated first

        setGoals(smartSort(data));
      });

      const collectionRefEvents = collection(db, "users", `${user}/events`);
      const qEvents = query(collectionRefEvents);

      onSnapshot(qEvents, (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            goal: doc.data().goal,
            name: doc.data().name,
            timestamp: doc.data().timestamp.toDate(),
          };
        });

        data.sort((a, b) => (a.goal > b.goal ? 1 : -1));

        let dataPoints = data
          .filter((event) => event.name === "up" || event.name === "down")
          .map((event) => {
            const value = event.name === "up" ? 1 : -1;

            return {
              goal: event.goal,
              label: event.timestamp,
              value: value,
            };
          });

        // setEvents(data);
        setGraphData(dataPoints);

        let goalSum = 0;
        data.forEach((item, index) => {
          goalSum += item.name === "up" ? 1 : -1;

          if (data[index + 1]?.goal !== item.goal) {
            // Save the data
            updateSum(item.goal, goalSum);

            // Reset
            goalSum = 0;
          }
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  function smartSort(goals: IGoal[]) {
    // if (!goals) return false;

    if (sorting.length > 0) {
      debugger;
      return goals.sort(
        (a, b) => sorting.indexOf(a.name) - sorting.indexOf(b.name)
      );
    }
    // TODO: Why does it goes here on update, on prod?

    // Before fika, show lowest first
    if (new Date().getHours() < 15) {
      goals.sort((a, b) => a.raw_date - b.raw_date);
    } else {
      goals.sort((a, b) => b.raw_date - a.raw_date);
    }
    debugger;

    setSorting(goals.map((goal) => goal.name));

    return goals;
  }

  if (user === null) {
    return <LoginButton />;
  }

  const isDone = (goal: IGoal) => {
    return goal.raw_date && addHours(1, goal.raw_date?.toDate()) > new Date();
  };

  return (
    <div className="App">
      <p>User: {user}</p>
      <button onClick={handleSorting}>sortera</button>

      <h1>Goals</h1>
      <button
        onClick={() => {
          if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
          } else {
            console.log("notifications", Notification.permission);

            Notification.requestPermission();
          }
        }}
      >
        OK notis
      </button>
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
      {goals?.map((goal) => {
        return (
          <div
            style={{
              padding: "10px",
              margin: "10px",
              border: "1px solid black",
            }}
            key={goal.id}
          >
            <strong>{goal.label}</strong>
            <br />
            <small>{ymd(goal.last_updated)}</small>
            <div
              style={{
                display: "flex",
                height: "80px",
                justifyContent: "space-between",
                verticalAlign: "bottom",
              }}
            >
              {!isDone(goal) && (
                <div>
                  <button
                    style={{
                      fontSize: "2em",
                    }}
                    onClick={() => handleDown(goal.id, goal.sum)}
                  >
                    👎
                  </button>
                </div>
              )}

              <div style={{ flexGrow: "1", width: "1%" }}>
                <Graph goal={goal.id} xy={oneGraph(goal.id)} />
              </div>

              {!isDone(goal) && (
                <div>
                  <button
                    style={{ fontSize: "2em" }}
                    onClick={() => handleUp(goal.id, goal.sum)}
                  >
                    {abPositiveEmoji}
                  </button>
                </div>
              )}
              {/* <button onClick={() => handleDelete(goal.id)}>Delete</button> */}
            </div>
          </div>
        );
      })}
      <h2>Add new</h2>
      <p>All missing default goals will be added if empty.</p>
      <input type="text" ref={inputRefNewGoal} />
      <button onClick={handleClick}>Add</button>
    </div>
  );
};

export default App;
