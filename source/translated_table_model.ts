import * as Kola from 'kola-signals';
import {ArrayTableModel} from './array_table_model';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {TableModel} from './table_model';

/** Adapts an existing TableModel with the ability to rearrange rows. */
export class TranslatedTableModel extends TableModel {

  /**
   * Constructs a model adapting an existing TableModel.
   * @param model The TableModel to adapt.
   */
  constructor(model: TableModel) {
    super();
    this.dispatcher = new Kola.Dispatcher<Operation>();
    this.translatedTable = new ArrayTableModel();
    for(let row = 0; row < model.rowCount; row++) {
      const rowCopy = [];
      for(let column = 0; column < model.columnCount; column++) {
        rowCopy.push(model.get(row, column));
      }
      this.translatedTable.push(rowCopy);
    }
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
   * Moves a row.
   * @param source - The index of the row to move.
   * @param destination - The new index of the row.
   * @throws RangeError - The index specified is not within range.
   */
  public moveRow(source: number, destination: number): void {
    if(source >= this.rowCount || source < 0 || destination >= this.rowCount ||
        destination < 0) {
      throw new RangeError('The index specified is not within range.');
    }
    this.translatedTable.move(source, destination);
    this.processOperation(new MoveRowOperation(source, destination));
  }

  public get rowCount(): number {
    return this.translatedTable.rowCount;
  }

  public get columnCount(): number {
    return this.translatedTable.columnCount;
  }

  public get(row: number, column: number): any {
    return this.translatedTable.get(row, column);
  }

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.dispatcher.listen(slot);
  }

  private processOperation(operation: Operation) {
    if(this.transactionArray === null) {
      this.dispatcher.dispatch(operation);
    } else {
      this.transactionArray.push(operation);
    }
  }

  private dispatcher: Kola.Dispatcher<Operation>;
  private translatedTable: ArrayTableModel;
  private transactionArray: Operation[];
}
