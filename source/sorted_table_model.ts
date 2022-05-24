import * as Kola from 'kola-signals';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';

export class SortedTableModel extends TableModel {

  /**
   * Constructs a model adapting an existing TableModel.
   * @param model The TableModel to adapt.
   */
  constructor(model: TableModel) {
    super();
    this.sourceTable = model;
  }

  public get rowCount(): number {
    throw new Error('Method not implemented.');
  }

  public get columnCount(): number {
    throw new Error('Method not implemented.');
  }

  public get(row: number, column: number) {
    throw new Error('Method not implemented.');
  }

  public connect(slot: (operation: Operation) => void): 
      Kola.Listener<Operation> {
    throw new Error('Method not implemented.');
  }

  public sortAscending(index: number) {
    throw new Error('Method not implemented.');
  }

  public sortDescending(index: number) {
    throw new Error('Method not implemented.');
  }

  private sourceTable: TableModel;
}
