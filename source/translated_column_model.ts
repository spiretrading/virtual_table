import * as Kola from 'kola-signals';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';

/** Adapts an existing TableModel with the ability to move columns. */
export class TranslatedColumnModel extends TableModel {
  constructor(model: TableModel) {
    super();
    this.sourceTable = model;
    this.columnOrder = [];
    for(let index = 0; index < model.columnCount; ++index) {
      this.columnOrder.push(index);
    }
    this.transactionLog = new TransactionLog();
  }

  public get rowCount(): number {
    return this.sourceTable.rowCount;
  }

  public get columnCount(): number {
    return this.columnOrder.length;
  }

  public get(row: number, column: number) {
    if(row >= this.rowCount || row < 0 || column < 0 ||
        column >= this.columnCount) {
      throw new RangeError(
        'Row or column are outside of the table\'s bounds.');
    }
    return this.sourceTable.get(row, this.columnOrder[column]);
  }

  /** Moves a column.
   * @param source - The original position of the column.
   * @param dest - The new position of the column.
   * @throws RangeError - The indexes specified is not within range.
   */
  public moveColumn(source: number, dest: number): void{
    if(source < 0 || dest < 0 || source >= this.columnCount ||
        dest >= this.columnCount) {
      throw new RangeError(
        'Source or destination are outside of the table\'s bounds.');
    }
    const sourceValue = this.columnOrder[source];
    this.columnOrder.splice(source, 1);
    this.columnOrder.splice(dest, 1, sourceValue);
  }

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.transactionLog.connect(slot);
  }

  columnOrder: number[];
  private sourceTable: TableModel;
  private transactionLog: TransactionLog;
}
