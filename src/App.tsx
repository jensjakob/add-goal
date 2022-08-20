import React from "react";
import "./App.css";

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
    </div>
  );
}

export default App;
