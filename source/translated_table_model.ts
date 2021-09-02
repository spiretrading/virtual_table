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
    model.connect(this.handleSourceOperation);
    this.sourceTable = model;
    this.translatedToSourceIndices = [];
    this.sourceToTranslatedIndices = [];
    for(let index = 0; index < model.rowCount; ++index) {
      this.translatedToSourceIndices.push(index);
      this.sourceToTranslatedIndices.push(index);
    }
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
    const sourceValue = this.translatedToSourceIndices[source];
    const multiplier = source < destination ? 1 : -1;
    for(let index = source; index != destination; index += multiplier) {
      this.translatedToSourceIndices[index] =
        this.translatedToSourceIndices[index + multiplier];
      this.sourceToTranslatedIndices[
        this.translatedToSourceIndices[index]] = index;
    }
    this.translatedToSourceIndices[destination] = sourceValue;
    this.sourceToTranslatedIndices[sourceValue] = destination;
    this.processOperation(new MoveRowOperation(source, destination));
  }

  public get rowCount(): number {
    return this.sourceTable.rowCount;
  }

  public get columnCount(): number {
    return this.sourceTable.columnCount;
  }

  public get(row: number, column: number): any {
    if(row >= this.rowCount || row < 0) {
      throw new RangeError(
        'Row or column are outside of the table\'s bounds.');
    } 
    return this.sourceTable.get(this.translatedToSourceIndices[row], column);
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

  private sourceAdd(operation: AddRowOperation) {
    const rowCount = this.translatedToSourceIndices.length;
    const originalIndices = {} as {[key: number]: number};
    for(let index = operation.index; index < rowCount; ++index) {
      const translatedIndex = originalIndices[index] ??
        this.sourceToTranslatedIndices[index];
      ++this.translatedToSourceIndices[translatedIndex];
      const newIndex = this.translatedToSourceIndices[translatedIndex];
      originalIndices[newIndex] = this.sourceToTranslatedIndices[newIndex];
      this.sourceToTranslatedIndices[newIndex] = translatedIndex;
    }
    this.translatedToSourceIndices.push(operation.index);
    this.sourceToTranslatedIndices[operation.index] = 
      this.translatedToSourceIndices.length - 1;
    this.processOperation(new AddRowOperation(rowCount));
  }

  private sourceMove(operation: MoveRowOperation) {
    const source = operation.source;
    const destination = operation.destination;
    const sourceIndex = this.sourceToTranslatedIndices[source];
    const originalIndices = {} as {[key: number]: number};
    let {index, loopEnd, increment} = (() => {
      if(source > destination) {
        return {index: destination, loopEnd: source, increment: 1};
      }
      return {index: source + 1, loopEnd: destination + 1, increment: -1};
    })();
    for(index; index < loopEnd; ++index) {
      const translatedIndex = originalIndices[index] ??
        this.sourceToTranslatedIndices[index];
      this.translatedToSourceIndices[translatedIndex] =
        this.translatedToSourceIndices[translatedIndex] + increment;
      const newIndex = this.translatedToSourceIndices[translatedIndex];
      originalIndices[newIndex] = this.sourceToTranslatedIndices[newIndex];
      this.sourceToTranslatedIndices[newIndex] = translatedIndex;
    }
    this.translatedToSourceIndices[sourceIndex] = destination;
    this.sourceToTranslatedIndices[destination] = sourceIndex;
  }

  private sourceRemove(operation: RemoveRowOperation) {
    const translatedIndex = this.sourceToTranslatedIndices[operation.index];
    const rowCount = this.translatedToSourceIndices.length;
    for(let index = 0; index < rowCount - 1; ++index) {
      if(index >= translatedIndex) {
        this.translatedToSourceIndices[index] =
          this.translatedToSourceIndices[index + 1];
        this.sourceToTranslatedIndices[this.translatedToSourceIndices[index]] =
          index;
      }
      const indexValue = this.translatedToSourceIndices[index];
      if(indexValue >= operation.index) {
        this.translatedToSourceIndices[index] = indexValue - 1;
        this.sourceToTranslatedIndices[indexValue - 1] = index;
      }
    }
    this.translatedToSourceIndices.pop();
    this.sourceToTranslatedIndices.pop();
    this.processOperation(new RemoveRowOperation(translatedIndex));
  }

  private sourceUpdate(operation: UpdateOperation) {
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
