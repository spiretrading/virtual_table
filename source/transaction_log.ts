import * as Kola from 'kola-signals';
import {Operation} from './operations';

/**
 * Keeps track of an on-going TableModel transaction and signals the
 * corresponding Operation on completion.
 */
export class TransactionLog {

  /** Constructs an empty log. */
  constructor() {}

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {}

  /** Ends a transaction. */
  public endTransaction(): void {}

  /**
   * Pushes an operation to this log.
   * @param operation The operation to push.
   */
  public push(operation: Operation): void {}

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return null;
  }
}
