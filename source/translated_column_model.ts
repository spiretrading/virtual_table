import * as Kola from 'kola-signals';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';

/** Adapts an existing TableModel with the ability to move columns. */
export class TranslatedColumnModel extends TableModel {
  constructor(model: TableModel) {
    super();
    model.connect(this.handleSourceOperation);
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

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.transactionLog.connect(slot);
  }

  /** Moves a column.
   * @param source - The original position of the column.
   * @param dest - The new position of the column.
   * @throws RangeError - The indexes specified is not within range.
   */
  public moveColumn(source: number, dest: number): void {
    this.beginTransaction(); 
    if(source < 0 || dest < 0 || source >= this.columnCount ||
        dest >= this.columnCount) {
      throw new RangeError(
        'Source or destination are outside of the table\'s bounds.');
    }
    const sourceValue = this.columnOrder[source];
    this.columnOrder.splice(source, 1);
    this.columnOrder.splice(dest, 0, sourceValue);
    this.endTransaction();
  }

  private handleSourceOperation = (operation: Operation) => {
    if(operation instanceof AddRowOperation) {
      this.sourceAdd(operation);
    } else if(operation instanceof MoveRowOperation) {
      this.sourceMove(operation);
    } else if(operation instanceof RemoveRowOperation) {
      this.sourceRemove(operation);
    } else if(operation instanceof UpdateOperation) {
      this.sourceUpdate(operation);
    } else if(operation instanceof Transaction) {
      this.beginTransaction();
      operation.operations.forEach(this.handleSourceOperation);
      this.endTransaction();
    }
  }

  beginTransaction() {
    this.transactionLog.beginTransaction();
  }

  endTransaction() {
    this.transactionLog.endTransaction();
  }

  sourceUpdate(operation: UpdateOperation) {
    const translatedIndex = this.columnOrder.indexOf(operation.column);
    this.transactionLog.push(new UpdateOperation(operation.row,
      translatedIndex));
  }

  sourceRemove(operation: RemoveRowOperation) {
    this.transactionLog.push(operation);
  }

  sourceMove(operation: MoveRowOperation) {
    this.transactionLog.push(operation);
  }

  sourceAdd(operation: AddRowOperation) {
    this.transactionLog.push(operation);
  }

  private columnOrder: number[];
  private sourceTable: TableModel;
  private transactionLog: TransactionLog;
}