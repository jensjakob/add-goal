import User from "./User";
import Dialog from "./Dialog";

const LoginButton = () => {
  return (
    <Dialog cta="Login">
      <User />
    </Dialog>
  );
};

export default LoginButton;
