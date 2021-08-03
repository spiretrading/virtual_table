import * as Kola from 'kola-signals';
import { Operation } from './operations';
import { TableModel } from './table_model';

/** Implements a TableModel using an 2-dimensional array. */
export class ArrayTableModel extends TableModel {

  /** Constructs an empty model. */
  constructor() {
    super();
    this.dispatcher = new Kola.Dispatcher<Operation>();
  }

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {}

  /** Ends a transaction. */
  public endTransaction(): void {}

  /**
   * Appends a row to the table.
   * @param row - The row to append.
   * @throws RangeError - The length of the row being added is not exactly equal
   *                      to this table's columnCount.
   */
  public push(row: any[]): void {}

  /**
   * Inserts a row to the table.
   * @param row - The row to insert.
   * @param index - The index to insert the row into.
   * @throws RangeError - The length of the row being added is not exactly equal
   *                      to this table's columnCount.
   * @throws RangeError - The index specified is not within range.
   */
  public insert(row: any[], index: number): void {}

  /**
   * Moves a row.
   * @param source - The index of the row to move.
   * @param destination - The index to move the row to.
   * @throws RangeError - The source or destination are not within this table's
   *                      range.
   */
  public move(source: number, destination: number): void {}

  /**
   * Removes a row from the table.
   * @param index - The index of the row to remove.
   * @throws RangeError - The index is not within this table's range.
   */
  public remove(index: number): void {}

  /**
   * Sets a value at a specified row and column.
   * @param row - The row to set.
   * @param column - The column to set.
   * @param value - The value to set at the specified row and column.
   * @throws RangeError - The row or column is not within this table's range.
   */
  public set(row: number, column: number, value: any): void {}

  public get rowCount(): number {
    return 0;
  }

  public get columnCount(): number {
    return 0;
  }

  public get(row: number, column: number): any {
    return 0;
  }

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.dispatcher.listen(slot);
  }

  private dispatcher: Kola.Dispatcher<Operation>;
}
