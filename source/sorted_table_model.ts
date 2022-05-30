import * as Kola from 'kola-signals';
import { Comparator } from './comparator';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import { SortOrder } from './sort_order';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';
import {TranslatedTableModel} from './translated_table_model';

/** A table that sorts columns. */
export class SortedTableModel extends TableModel {

  /**
   * Constructs a model adapting an existing TableModel.
   * @param model The TableModel to adapt.
   */
  constructor(model: TableModel) {
    super();
    this.comparator = new Comparator();
    this.sortOrder = [];
    for(let i = 0; i < model.columnCount; ++i) {
      this.sortOrder.push(SortOrder.NONE);
    }
    this.sortPriority = [];
    this.transactionLog = new TransactionLog();
    this.translatedTable = new TranslatedTableModel(model);
    this.translatedTable.connect(this.handleSourceOperation);
    this.movesToIgnore = 0;
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

  public get rowCount(): number {
    return this.translatedTable.rowCount;
  }

  public get columnCount(): number {
    return this.translatedTable.columnCount;
  }

  public get(row: number, column: number) {
    return this.translatedTable.get(row, column);
  }

  public connect(slot: (operation: Operation) => void):
      Kola.Listener<Operation> {
    return this.transactionLog.connect(slot);
  }

  /** 
   * Sorts the table using @param column as the column with the highest sort
   * priority. All previous sort priorities are pushed down a rank.
   * @param column - The column that will now have the highest priority
   * @param sortOrder - The sort order of column.
   */
  public updateSort(column: number, sortOrder: SortOrder) {
    if(sortOrder === SortOrder.UNSORTABLE) {
      throw new Error('The column is unsortable.');
    }
    if(sortOrder === SortOrder.NONE) {
      throw new Error('The column is neither ascending or descending.');
    }
    this.sortOrder[column] = sortOrder;
    if(this.sortPriority.includes(column)) {
      this.sortPriority.splice(this.sortPriority.indexOf(column), 1).unshift(
        column);
    } else {
      this.sortPriority.unshift(column);
    }
    this.sortPriority = [column];
    this.sort();
  }

  private sort() {
    const rowOrdering = [];
    for(let i = 0; i < this.translatedTable.rowCount; ++i) {
      rowOrdering.push(i);
    }
    rowOrdering.sort((a, b) => this.compareRows(a, b));
    for(let i = 0; i < rowOrdering.length; ++i) {
      this.translatedTable.moveRow(rowOrdering[i], i);
      for(let j = i + 1; j < rowOrdering.length; ++j) {
        if(rowOrdering[j] < rowOrdering[i]) {
          ++rowOrdering[j];
        }
      }
    }
  }

  private compareRows(a: number, b: number) {
    for(let i = 0; i < this.sortPriority.length; ++i) {
      const value = this.comparator.compareValues(
        this.translatedTable.get(a, this.sortPriority[i]),
        this.translatedTable.get(b, this.sortPriority[i]));
      if(value !== 0) {
        if(this.sortOrder[this.sortPriority[i]] === SortOrder.ASCENDING) {
          return value;
        } else {
          return -value;
        }
      }
    }
    return 0;
  }

  private handleSourceOperation = (operation: Operation) => {
    if(operation instanceof AddRowOperation) {
      this.sourceAdd(operation);
    } else if(operation instanceof MoveRowOperation) {
      this.sourceMove(operation);
    } else if(operation instanceof RemoveRowOperation) {
      this.transactionLog.push(operation);
    } else if(operation instanceof UpdateOperation) {
      this.sourceUpdate(operation);
    } else if(operation instanceof Transaction) {
      this.beginTransaction();
      operation.operations.forEach(this.handleSourceOperation);
      this.endTransaction();
    }
  }

  private sourceAdd(operation: AddRowOperation) {
    console.log('add', operation.index);
    const sortedIndex = this.findSortedIndex(operation.index);
    ++this.movesToIgnore;
    this.translatedTable.moveRow(operation.index, sortedIndex);
    console.log('move', operation.index, sortedIndex);
    this.transactionLog.push(new AddRowOperation(sortedIndex));
  }

  private sourceMove(operation: MoveRowOperation) {
    if(this.movesToIgnore > 0) {
      --this.movesToIgnore
    } else if(operation.source !== operation.destination){
      this.transactionLog.push(operation);
    }
  }

  private sourceUpdate(operation: UpdateOperation) {
    this.beginTransaction();
    const sortedIndex = this.findSortedIndex(operation.row);
    this.translatedTable.moveRow(operation.row, sortedIndex);
    this.transactionLog.push(new UpdateOperation(
      sortedIndex, operation.column));
    this.endTransaction();
  }

  private findSortedIndex(source: number): number {
    if(source !== 0 &&
        this.compareRows(source, source - 1) < 0) {
      return this.findInHead(0, source - 1, source);
    } else if(source !== this.rowCount - 1 &&
        this.compareRows(source, source + 1) > 0) {
      return this.findInTail(source + 1, this.rowCount - 1,
        source);
    } else {
      return source;
    }
  }

  private findInHead(start: number, end: number, indexOfValue: number) {
    while(start < end) {
      const middle = Math.floor((start + end) / 2);
      if(this.compareRows(indexOfValue, middle) < 0) {
        end = middle;
      } else {
        start = middle + 1;
      }
    }
    return end;
  }

  private findInTail(start: number, end: number, indexOfValue: number) {
    while(start < end) {
      const middle = Math.ceil((start + end) / 2);
      if(this.compareRows(middle, indexOfValue) < 0) {
        start = middle;
      } else {
        end = middle - 1;
      }
    }
    return start;
  }

  private comparator: Comparator;
  private translatedTable: TranslatedTableModel;
  private sortOrder: SortOrder[];
  private sortPriority: number[];
  private transactionLog: TransactionLog;
  private movesToIgnore: number;
}
