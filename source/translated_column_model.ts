import * as Kola from 'kola-signals';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';

export class TranslatedColumnModel extends TableModel {
  constructor(model: TableModel) {
    super();
    this.sourceTable = model;
    this.translatedToSourceColumns = [];
    for(let index = 0; index < model.columnCount; ++index) {
      this.translatedToSourceColumns.push(index);
    }
    this.transactionLog = new TransactionLog();
  }

  public get rowCount(): number {
    return this.sourceTable.rowCount;
  }

  public get columnCount(): number {
    return this.sourceTable.columnCount;
  }

  public get(row: number, column: number) {
    if(row >= this.rowCount || row < 0) {
      throw new RangeError(
        'Row or column are outside of the table\'s bounds.');
    } 
    return this.sourceTable.get(row, this.translatedToSourceColumns[column]);
  }

  public connect(
      slot: (operations: Operation) => void): Kola.Listener<Operation> {
    return this.transactionLog.connect(slot);
  }

  translatedToSourceColumns: number[];
  private sourceTable: TableModel;
  private transactionLog: TransactionLog;
}
