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
    this.transactionArray = [];
    this.transactionDepth = -1;
  }

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {
    if(this.transactionDepth > -1) {
      const lastNestedArray = this.getLastNestedArray(this.transactionArray,
        this.transactionDepth);
      lastNestedArray.push([]);
    }
    this.transactionDepth += 1;
  }

  /** Ends a transaction. */
  public endTransaction(): void {
    if(this.transactionDepth > 0) {
      const lastNestedArrayParent = this.getLastNestedArray(
        this.transactionArray, this.transactionDepth - 1);
      const lastNestedArray = lastNestedArrayParent.pop();
      const transaction = new Transaction(lastNestedArray);
      lastNestedArrayParent.splice(lastNestedArrayParent.length, 0,
        ...lastNestedArray);
      this.transactionDepth -= 1;
      this.dispatcher.dispatch(transaction);      
    } else if(this.transactionDepth === 0){
      const transaction = new Transaction(this.transactionArray);
      this.transactionArray = [];
      this.transactionDepth -= 1;
      this.dispatcher.dispatch(transaction);
    }
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
    this.table.push(row.slice());
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
    this.table.splice(index, 0, row.slice());
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
    this.table.splice(destination, 0, this.table.splice(source, 1)[0]);
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
    this.table.splice(index, 1);
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
    if(row >= this.rowCount || column >= this.columnCount) {
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
    if(row >= this.rowCount || column >= this.columnCount) {
      return new RangeError(
        'Row or column are outside of the table\'s bounds');
    } else {
      return this.table[row][column];
    }
  }

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.dispatcher.listen(slot);
  }

  private processOperation(operation: Operation) {
    if(this.transactionDepth === -1) {
      this.dispatcher.dispatch(operation);
    } else {
      const lastNestedArray = this.getLastNestedArray(this.transactionArray,
        this.transactionDepth);
      lastNestedArray.push(operation);
    }
  }

  private getLastNestedArray(array: any[], depth: number): any[] {
    const lastElement = array[array.length - 1];
    if(Array.isArray(lastElement) && depth > 0) {
      return this.getLastNestedArray(lastElement, depth - 1);
    } else {
      return array;
    }
  }

  private dispatcher: Kola.Dispatcher<Operation | Transaction>;
  private table: any[][];
  private transactionArray: Operation[];
  private transactionDepth: number;
}
