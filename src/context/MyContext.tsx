import { createContext, useState } from "react";

interface Props {
  children?: JSX.Element;
}

interface IState {
  user: string | null;
}

interface IContext {
  state: IState;
  setState: (state: IState) => void;
}

export const MyContext = createContext<Partial<IContext>>({});

const MyContextProvider: React.FC<Props> = ({ children }) => {
  const [state, setState] = useState<IState>({ user: null });

  if (!state.user) {
    const localState = localStorage.getItem("state");
    if (localState) {
      setState(JSON.parse(localState));
    }
  }

  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyContextProvider;
