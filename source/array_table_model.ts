import * as Kola from 'kola-signals';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {TableModel} from './table_model';

/** Implements a TableModel using an 2-dimensional array. */
export class ArrayTableModel extends TableModel {

  /** Constructs an empty model. */
  constructor() {
    super();
    this.dispatcher = new Kola.Dispatcher<Operation | Transaction>();
    this.table = [];
    this.transactionObject = {};
  }

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {
    const depth = Object.keys(this.transactionObject).length;
    this.transactionObject[depth + 1] = [];
  }

  /** Ends a transaction. */
  public endTransaction(): void {
    const depth = Object.keys(this.transactionObject).length;
    const transaction = new Transaction(this.transactionObject[depth]);
    delete this.transactionObject[depth];
    if(depth > 1) {
      this.transactionObject[depth - 1].push(transaction);
    }
    this.dispatcher.dispatch(transaction);
  }

  /**
   * Appends a row to the table.
   * @param row - The row to append.
   * @throws RangeError - The length of the row being added is not exactly equal
   *                      to this table's columnCount.
   */
  public push(row: any[]): void {
    if(row.length > this.columnCount && this.columnCount !== 0) {
      throw new RangeError('The length of the row being added is not ' +
        'exactly equal to this table\'s columnCount.');
    }
    this.table.push(row);
    this.processOperation(new AddRowOperation(this.table.length - 1));
  }

  /**
   * Inserts a row to the table.
   * @param row - The row to insert.
   * @param index - The index to insert the row into.
   * @throws RangeError - The length of the row being added is not exactly equal
   *                      to this table's columnCount.
   * @throws RangeError - The index specified is not within range.
   */
  public insert(row: any[], index: number): void {
    if(row.length > this.columnCount) {
      throw new RangeError('The length of the row being added is not ' +
        'exactly equal to this table\'s columnCount.');
    } else if(index >= this.rowCount) {
      throw new RangeError('The index specified is not within range.');
    }
    this.table.push(row);
    for(let i = this.table.length - 1; i > index; i--) {
      let row = this.table[i];
      this.table[i] = this.table[i - 1];
      this.table[i - 1] = row;
    }
    this.processOperation(new AddRowOperation(index));
  }

  /**
   * Moves a row.
   * @param source - The index of the row to move.
   * @param destination - The index to move the row to.
   * @throws RangeError - The source or destination are not within this table's
   *                      range.
   */
  public move(source: number, destination: number): void {
    if(source > this.rowCount - 1 || destination > this.rowCount - 1) {
      throw new RangeError('The source or destination are not within this ' + 
        'table\'s range.');
    }
    if(source > destination) {
      for(let i = source; i > destination; i--) {
        let row = this.table[i];
        this.table[i] = this.table[i - 1];
        this.table[i - 1] = row;
      }
    } else {
      for(let i = source; i < destination; i++) {
        let row = this.table[i];
        this.table[i] = this.table[i + 1];
        this.table[i + 1] = row;
      }
    }
    this.processOperation(new MoveRowOperation(source, destination));
  }

  /**
   * Removes a row from the table.
   * @param index - The index of the row to remove.
   * @throws RangeError - The index is not within this table's range.
   */
  public remove(index: number): void {
    if(index > this.rowCount - 1) {
      throw new RangeError('The index is not within this table\'s range.');
    }
    const lastIndex = this.rowCount - 1;
    for(let i = index; i <= lastIndex; i++) {
      this.table[i] = this.table[i + 1];
    }
    this.table.pop();
    this.processOperation(new RemoveRowOperation(index));
  }

  /**
   * Sets a value at a specified row and column.
   * @param row - The row to set.
   * @param column - The column to set.
   * @param value - The value to set at the specified row and column.
   * @throws RangeError - The row or column is not within this table's range.
   */
  public set(row: number, column: number, value: any): void {
    const oldValue = this.table[row]?.[column];
    if(!oldValue && oldValue !== 0) {
      throw new RangeError('The row or column is not within this table\'s ' +
        'range.');
    }
    this.table[row][column] = value;
    this.processOperation(new UpdateOperation(row, column));
  }

  public get rowCount(): number {
    return this.table.length;
  }

  public get columnCount(): number {
    return this.table[0]?.length || 0;
  }

  public get(row: number, column: number): any {
    const value = this.table[row]?.[column];
    if(!value && value !== 0) {
      return new RangeError(
        'Row or column are outside of the table\'s bounds');
    } else {
      return value;
    }
  }

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.dispatcher.listen(slot);
  }

  private processOperation(operation: Operation) {
    const depth = Object.keys(this.transactionObject).length;
    if(depth === 0) {
      this.dispatcher.dispatch(operation);
    } else {
      this.transactionObject[depth].push(operation);
    }
  }

  private dispatcher: Kola.Dispatcher<Operation | Transaction>;
  private table: any[][];
  private transactionObject: {[key: string]: (Operation | Transaction)[]};
}
