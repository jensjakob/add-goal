import React from "react";
import "./App.css";
import LoginButton from "./components/LoginButton";

import styles from "./App.module.css";

interface Goal {
  id: number;
  text: string;
}

function App() {
  const [goals, setGoals] = React.useState<Goal[]>([
    { id: 1, text: "Set goals" },
  ]);

  return (
    <div className="App">
      <h1>Goals</h1>
      <ul>
        {goals.map((goal) => (
          <li key={goal.id}>{goal.text}</li>
        ))}
      </ul>
      <button
        onClick={() =>
          setGoals([...goals, { id: goals.length + 1, text: "New goal" }])
        }
      >
        Add
      </button>

      <LoginButton className={styles.open} thing="Login"></LoginButton>
    </div>
  );
}

export default App;
