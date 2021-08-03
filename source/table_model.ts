import * as Kola from 'kola-signals';
import { Operation } from './operations';

/** Base class representing a table based data model. */
export abstract class TableModel {

  /**
   * Returns the number of rows in the model.
   * @return The number of rows in the model.
   */
  public abstract get rowCount(): number;

  /**
   * Returns the number of columns in the model.
   * @return The number of columns in the model.
   */
  public abstract get columnCount(): number;

  /**
   * Returns the value at a specified index within the table.
   * @param row - The value's row.
   * @param column - The value's column.
   * @return The value at the specified row and column.
   * @throws {RangeError} If the row or column are outside of the table's
   *                      bounds.
   */
  public abstract get(row: number, column: number): any;

  /**
   * Connects a slot to a signal indicating a series of operations was
   * performed on the table.
   * @param slot - A slot receiving the signal.
   * @return The connection between the signal and the slot.
   */
  public abstract connect(
    slot: (operation: Operation) => void): Kola.Listener<Operation>;
}
