import * as Kola from 'kola-signals';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';

/** Adapts an existing TableModel with the ability to rearrange rows. */
export class TranslatedTableModel extends TableModel {

  /**
   * Constructs a model adapting an existing TableModel.
   * @param model The TableModel to adapt.
   */
  constructor(model: TableModel) {
    super();
    model.connect(this.handleSourceOperation);
    this.sourceTable = model;
    this.translatedToSourceIndices = [];
    this.sourceToTranslatedIndices = [];
    for(let index = 0; index < model.rowCount; ++index) {
      this.translatedToSourceIndices.push(index);
      this.sourceToTranslatedIndices.push(index);
    }
    this.transactionLog = new TransactionLog();
  }

  /**
   * Marks the beginning of a transaction. In cases where a transaction is
   * already being processed, then the sub-transaction gets consolidated into
   * the parent transaction.
   */
  public beginTransaction(): void {
    this.transactionLog.beginTransaction();
  }

  /** Ends a transaction. */
  public endTransaction(): void {
    this.transactionLog.endTransaction();
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
    if(source === destination) {
      return;
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
    this.transactionLog.push(new MoveRowOperation(source, destination));
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
    return this.transactionLog.connect(slot);
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
    if(operation.index === rowCount) {
      this.sourceToTranslatedIndices.push(operation.index);
    } else {
      for(let index = operation.index; index < rowCount; ++index) {
        ++this.translatedToSourceIndices[
          this.sourceToTranslatedIndices[index]];
      }
      this.sourceToTranslatedIndices.splice(operation.index, 0, rowCount);
    }
    this.translatedToSourceIndices.push(operation.index);
    this.transactionLog.push(new AddRowOperation(rowCount));
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
    const sourceIndex = operation.index;
    const reverseIndex = this.sourceToTranslatedIndices[sourceIndex];
    this.shift(-1, sourceIndex, reverseIndex);
    this.translatedToSourceIndices.splice(reverseIndex, 1);
    this.sourceToTranslatedIndices.splice(sourceIndex, 1);
    this.transactionLog.push(new RemoveRowOperation(reverseIndex));
  }

  private shift(amount: number, rowIndex: number, reverseIndex: number) {
    for(let i = 0; i < this.translatedToSourceIndices.length; ++i) {
      if(this.translatedToSourceIndices[i] >= rowIndex) {
        this.translatedToSourceIndices[i] += amount;
      }
      if(this.sourceToTranslatedIndices[i] >= reverseIndex) {
        this.sourceToTranslatedIndices[i] += amount;
      }
    }
  }

  private sourceUpdate(operation: UpdateOperation) {
    const translatedIndex = this.sourceToTranslatedIndices[operation.row];
    this.transactionLog.push(new UpdateOperation(translatedIndex,
      operation.column));
  }

  private sourceTable: TableModel;
  private translatedToSourceIndices: number[];
  private sourceToTranslatedIndices: number[];
  private transactionLog: TransactionLog;
}
