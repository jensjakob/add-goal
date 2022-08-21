import * as Primitive from "@radix-ui/react-dialog";
import styles from "./Dialog.module.css";

interface Props {
  className?: string;
  thing?: any;
  children: React.ReactNode;
}

export const Dialog: React.FC<Props> = ({ className, thing, children }) => {
  return (
    <Primitive.Root>
      <Primitive.Trigger className={className}>{thing}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Overlay />
        <Primitive.Content className={styles.portal}>
          <Primitive.Title>Titel</Primitive.Title>
          <Primitive.Description></Primitive.Description>
          {children}
          <Primitive.Close>Stäng</Primitive.Close>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
};

export default Dialog;
