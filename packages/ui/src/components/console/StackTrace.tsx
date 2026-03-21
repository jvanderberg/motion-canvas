import clsx from 'clsx';
import {openFileInEditor, type StackTraceEntry} from '../../utils';
import styles from './Console.module.scss';

export interface StackTraceProps {
  entries: StackTraceEntry[];
}

export function StackTrace({entries}: StackTraceProps) {
  return (
    <div className={styles.stack}>
      {entries.map(entry => (
        <div
          key={`${entry.file}:${entry.line}:${entry.column}`}
          className={clsx(styles.entry, entry.isExternal && styles.external)}
        >
          at {entry.functionName} (
          {entry.isExternal ? (
            `${entry.file}:${entry.line}:${entry.column}`
          ) : (
            <button
              className={styles.link}
              onClick={() => openFileInEditor(entry)}
            >
              {entry.file}:{entry.line}:{entry.column}
            </button>
          )}
          )
        </div>
      ))}
    </div>
  );
}
