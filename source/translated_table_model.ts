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
    model.connect((operation: Operation | Transaction) => {
      this.processSourceOperation(operation);
    });
    this.sourceTable = model;
    this.sourceRowIndices = [...new Array(model.rowCount)].
      map((value, index) => index);
    this.transactionArray = null;
    this.transactionDepth = -1;
  }

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {
    if(this.transactionArray === null) {
      this.transactionArray = [];
    }
    this.transactionDepth += 1;
  }

  /** Ends a transaction. */
  public endTransaction(): void {
    if(this.transactionDepth === 0) {
      this.dispatcher.dispatch(new Transaction(this.transactionArray));
      this.transactionArray = null;
    }
    if(this.transactionDepth > -1) {
      this.transactionDepth -= 1;
    }
  }

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
    this.sourceRowIndices.splice(destination, 0,
      this.sourceRowIndices.splice(source, 1)[0]);
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

  private processSourceOperation = (operation: Operation) => {
    if(operation instanceof AddRowOperation) {
      this.processSourceAdd(operation);
    } else if(operation instanceof MoveRowOperation) {
      this.processSourceMove(operation);
    } else if(operation instanceof RemoveRowOperation) {
      this.processSourceRemove(operation);
    } else if(operation instanceof UpdateOperation) {
      this.processSourceUpdate(operation);
    } else if(operation instanceof Transaction) {
      this.beginTransaction();
      operation.operations.forEach(this.processSourceOperation);
      this.endTransaction();
    }
  }

  private processSourceAdd(operation: AddRowOperation) {
    const rowIndex = operation.index;
    const row = []      
    for(let column = 0; column < this.sourceTable.columnCount; column++) {
      row.push(this.sourceTable.get(rowIndex, column));
    }
    this.translatedTable.push(row);
    this.sourceRowIndices = this.sourceRowIndices.map(sourceIndex =>
      sourceIndex >= rowIndex ? sourceIndex + 1 : sourceIndex);
    this.sourceRowIndices.push(operation.index);
    this.processOperation(new AddRowOperation(this.rowCount - 1));
  }

  private processSourceMove(operation: MoveRowOperation) {
    const sourceIndex = operation.source;
    const destinationIndex = operation.destination;
    const translatedSourceIndex = this.sourceRowIndices.
      findIndex(index => index === sourceIndex);
    const translatedDestinationIndex = this.sourceRowIndices.
      findIndex(index => index === destinationIndex);
    this.translatedTable.move(translatedSourceIndex,
      translatedDestinationIndex);
    this.sourceRowIndices.splice(translatedDestinationIndex, 0,
      this.sourceRowIndices.splice(translatedSourceIndex, 1)[0]);
    this.sourceRowIndices = this.sourceRowIndices.map(translatedIndex => {
      if(translatedIndex >= destinationIndex &&
          translatedIndex < sourceIndex) {
        return translatedIndex + 1;
      } else if(translatedIndex > sourceIndex &&
        translatedIndex <= destinationIndex) {
      return translatedIndex - 1;
      } else if(translatedIndex === sourceIndex) {
        return destinationIndex;
      } else {
        return translatedIndex;
      }
    });
    this.processOperation(new MoveRowOperation(translatedSourceIndex,
      translatedDestinationIndex));
  }

  private processSourceRemove(operation: RemoveRowOperation) {
    const rowIndex = operation.index;
    const translatedIndex = this.sourceRowIndices.findIndex(index =>
      index === rowIndex);
    this.translatedTable.remove(translatedIndex);
    this.sourceRowIndices.splice(translatedIndex, 1);
    this.sourceRowIndices = this.sourceRowIndices.map((sourceIndex, index) =>
      index >= rowIndex ? sourceIndex - 1 : sourceIndex);
    this.processOperation(new RemoveRowOperation(translatedIndex));
  }

  private processSourceUpdate(operation: UpdateOperation) {
    const rowIndex = operation.row;
    const columnIndex = operation.column;
    const value = this.sourceTable.get(rowIndex, columnIndex);
    const translatedIndex = this.sourceRowIndices.findIndex(index =>
      index === rowIndex);
    this.translatedTable.set(translatedIndex, columnIndex, value);
    this.processOperation(new UpdateOperation(translatedIndex, columnIndex));
  }

  private dispatcher: Kola.Dispatcher<Operation>;
  private sourceTable: TableModel;
  private sourceRowIndices: number[];
  private translatedTable: ArrayTableModel;
  private transactionArray: Operation[];
  private transactionDepth: number;
}
