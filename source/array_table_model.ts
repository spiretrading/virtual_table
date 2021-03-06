import * as Kola from 'kola-signals';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  UpdateOperation} from './operations';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';

/** Implements a TableModel using an 2-dimensional array. */
export class ArrayTableModel extends TableModel {

  /** Constructs an empty model. */
  constructor() {
    super();
    this.table = [];
    this.transactionLog = new TransactionLog();
  }

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {
    this.transactionLog.beginTransaction();
  }

  /** Ends a transaction. */
  public endTransaction(): void {
    this.transactionLog.endTransaction();
  }

  /**
   * Appends a row to the table.
   * @param row - The row to append.
   * @throws RangeError - The length of the row being added is not exactly equal
   *                      to this table's columnCount.
   */
  public push(row: any[]): void {
    this.insert(row, this.rowCount);
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
    if(this.rowCount !== 0 && row.length !== this.columnCount) {
      throw new RangeError('The length of the row being added is not ' +
        'exactly equal to this table\'s columnCount.');
    } else if(index > this.rowCount || index < 0) {
      throw new RangeError('The index specified is not within range.');
    }
    this.table.splice(index, 0, row.slice());
    this.transactionLog.push(new AddRowOperation(index));
  }

  /**
   * Moves a row.
   * @param source - The index of the row to move.
   * @param destination - The index to move the row to.
   * @throws RangeError - The source or destination are not within this table's
   *                      range.
   */
  public move(source: number, destination: number): void {
    if(source >= this.rowCount || source < 0 || destination >= this.rowCount ||
        destination < 0) {
      throw new RangeError('The source or destination are not within this ' + 
        'table\'s range.');
    }
    this.table.splice(destination, 0, this.table.splice(source, 1)[0]);
    this.transactionLog.push(new MoveRowOperation(source, destination));
  }

  /**
   * Removes a row from the table.
   * @param index - The index of the row to remove.
   * @throws RangeError - The index is not within this table's range.
   */
  public remove(index: number): void {
    if(index >= this.rowCount || index < 0) {
      throw new RangeError('The index is not within this table\'s range.');
    }
    this.table.splice(index, 1);
    this.transactionLog.push(new RemoveRowOperation(index));
  }

  /**
   * Sets a value at a specified row and column.
   * @param row - The row to set.
   * @param column - The column to set.
   * @param value - The value to set at the specified row and column.
   * @throws RangeError - The row or column is not within this table's range.
   */
  public set(row: number, column: number, value: any): void {
    if(row >= this.rowCount || row < 0 || column >= this.columnCount ||
        column < 0) {
      throw new RangeError('The row or column is not within this table\'s ' +
        'range.');
    }
    this.table[row][column] = value;
    this.transactionLog.push(new UpdateOperation(row, column));
  }

  public get rowCount(): number {
    return this.table.length;
  }

  public get columnCount(): number {
    return this.table[0]?.length || 0;
  }

  public get(row: number, column: number): any {
    if(row >= this.rowCount || row < 0 || column >= this.columnCount ||
        column < 0) {
      throw new RangeError(
        'Row or column are outside of the table\'s bounds.');
    } else {
      return this.table[row][column];
    }
  }

  public connect(
    slot: (operations: Operation) => void): Kola.Listener<Operation> {
  return this.transactionLog.connect(slot);
}

  private table: any[][];
  private transactionLog: TransactionLog;
}
