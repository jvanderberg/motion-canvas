import Container from '@theme/CodeBlock/Container';
import clsx from 'clsx';
import type {ReactNode} from 'react';
import styles from './styles.module.css';

export default function ApiContainer({
  children,
}: {
  children: ReactNode | ReactNode[];
}) {
  return (
    <Container
      as="div"
      className={clsx(styles.codeBlockContainer, 'language-typescript')}
    >
      {children}
    </Container>
  );
}
