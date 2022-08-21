import Dialog from "./Dialog";

interface Props {
  className?: string;
  thing?: any;
}

export const x: React.FC<Props> = ({ className, thing }) => {
  return (
    <Dialog className={className} thing={thing}>
      {/* <form>
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
      </form> */}
    </Dialog>
  );
};

export default x;
