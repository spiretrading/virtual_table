import * as Kola from 'kola-signals';
import {Operation, Transaction} from './operations';

/**
 * Keeps track of an on-going TableModel transaction and signals the
 * corresponding Operation on completion.
 */
export class TransactionLog {

  /** Constructs an empty log. */
  constructor() {
    this.dispatcher = new Kola.Dispatcher<Operation>();
    this.log = [];
    this.depth = 0;
  }

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {
    ++this.depth;
  }

  /** Ends a transaction. */
  public endTransaction(): void {
    if(this.depth === 1) {
      this.dispatcher.dispatch(new Transaction(this.log));
      this.log = [];
    }
    if(this.depth > 0) {
      --this.depth;
    }
  }

  /**
   * Pushes an operation to this log.
   * @param operation The operation to push.
   */
  public push(operation: Operation): void {
    if(this.depth === 0) {
      this.dispatcher.dispatch(operation);
    } else {
      this.log.push(operation);
    }
  }

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.dispatcher.listen(slot);
  }

  private dispatcher: Kola.Dispatcher<Operation>;
  private log: Operation[];
  private depth: number;
}
