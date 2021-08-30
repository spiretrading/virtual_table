import * as Kola from 'kola-signals';
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
    model.connect(this.processSourceOperation);
    this.sourceTable = model;
    this.translatedToSourceIndices = [...new Array(model.rowCount)].
      map((value, index) => index);
    this.sourceToTranslatedIndices = this.translatedToSourceIndices.slice();
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
    this.translatedToSourceIndices.splice(destination, 0,
      this.translatedToSourceIndices.splice(source, 1)[0]);
    this.translatedToSourceIndices.forEach((sourceRowIndex, index) => {
      this.sourceToTranslatedIndices[sourceRowIndex] = index;
    });
    this.processOperation(new MoveRowOperation(source, destination));
  }

  public get rowCount(): number {
    return this.sourceTable.rowCount;
  }

  public get columnCount(): number {
    return this.sourceTable.columnCount;
  }

  public get(row: number, column: number): any {
    if(row >= this.rowCount || row < 0 || column >= this.columnCount ||
        column < 0) {
      throw new RangeError('The row or column is not within this table\'s ' +
        'range.');
    } else {
      return this.sourceTable.get(this.translatedToSourceIndices[row], column);
    }
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
    this.translatedToSourceIndices = this.translatedToSourceIndices.
    map((sourceIndex, index) => {
      const newSourceIndex = sourceIndex >= operation.index ? sourceIndex + 1 :
        sourceIndex;
      this.sourceToTranslatedIndices[newSourceIndex] = index;
      return newSourceIndex;
    });
    this.translatedToSourceIndices.push(operation.index);
    this.sourceToTranslatedIndices[operation.index] =
      this.translatedToSourceIndices.length - 1;
    this.processOperation(new AddRowOperation(this.rowCount - 1));
  }

  private processSourceMove(operation: MoveRowOperation) {
    const sourceIndex = operation.source;
    const destinationIndex = operation.destination;
    const translatedSourceIndex = this.sourceToTranslatedIndices[sourceIndex];
    const translatedDestinationIndex = this.sourceToTranslatedIndices[
      destinationIndex];
    this.translatedToSourceIndices.splice(translatedDestinationIndex, 0,
      this.translatedToSourceIndices.splice(translatedSourceIndex, 1)[0]);
    this.translatedToSourceIndices = this.translatedToSourceIndices.
      map((translatedIndex, index) => {
        const newTranslatedIndex = (() => {
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
        })();
        this.sourceToTranslatedIndices[newTranslatedIndex] = index;
        return newTranslatedIndex;
      });
    this.processOperation(new MoveRowOperation(translatedSourceIndex,
      translatedDestinationIndex));
  }

  private processSourceRemove(operation: RemoveRowOperation) {
    const rowIndex = operation.index;
    const translatedIndex = this.sourceToTranslatedIndices[rowIndex];
    this.translatedToSourceIndices.splice(translatedIndex, 1);
    this.translatedToSourceIndices = this.translatedToSourceIndices.
      map((sourceIndex, index) => {
        const newSourceIndex = index >= rowIndex ? sourceIndex - 1 :
          sourceIndex;
        this.sourceToTranslatedIndices[newSourceIndex] = index;
        return newSourceIndex;
    });
    this.processOperation(new RemoveRowOperation(translatedIndex));
  }

  private processSourceUpdate(operation: UpdateOperation) {
    const translatedIndex = this.sourceToTranslatedIndices[operation.row];
    this.processOperation(new UpdateOperation(translatedIndex,
      operation.column));
  }

  private dispatcher: Kola.Dispatcher<Operation>;
  private sourceTable: TableModel;
  private translatedToSourceIndices: number[];
  private sourceToTranslatedIndices: number[];
  private transactionArray: Operation[];
  private transactionDepth: number;
}
