import * as Kola from 'kola-signals';
import {Comparator} from './comparator';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import {SortOrder} from './sort_order';
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
    this.movesToIgnore = 0;
    this.sortPriority = [];
    this.transactionLog = new TransactionLog();
    this.translatedTable = new TranslatedTableModel(model);
    this.sortOrder = [];
    for(let i = 0; i < this.translatedTable.columnCount; ++i) {
      this.sortOrder.push(SortOrder.NONE);
    }
    this.translatedTable.connect(this.handleSourceOperation);
  }

  /**
   * Returns the index of the column has the highest sort priority,
   * or -1 if no column has the highest.
   */
  public getHighestPriorityColumn(): number {
    if(this.sortPriority.length > 0) {
      this.sortPriority[0];
    } else {
      return -1;
    }
  }

  /**
   * Changes the sortOrder of the @param column. If sortOrder is NONE or
   * UNSORTABLE the column will have no sort priority.
   * If sortOrder is ASCENDING or DESCENDING the table will update the sort
   * with @param column being given the highest priority.
   * @param column - The column that is being changed.
   * @param sortOrder - The sort order of column.
   */
  public updateSortOrder(column: number, sortOrder: SortOrder) {
    if(column < 0 || this.columnCount <= column) {
      throw new Error('The column is outside of range.');
    }
    if(this.sortPriority.includes(column)) {
      this.sortPriority.splice(this.sortPriority.indexOf(column), 1);
    }
    if(sortOrder !== SortOrder.NONE && sortOrder !== SortOrder.UNSORTABLE) {
      this.sortPriority.unshift(column);
    }
    this.sortOrder[column] = sortOrder;
    this.sort();
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

  private compareRows(left: number, right: number) {
    for(let i = 0; i < this.sortPriority.length; ++i) {
      const value = this.comparator.compareValues(
        this.translatedTable.get(left, this.sortPriority[i]),
        this.translatedTable.get(right, this.sortPriority[i]));
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

  private beginTransaction(): void {
    this.transactionLog.beginTransaction();
  }

  private endTransaction(): void {
    this.transactionLog.endTransaction();
  }

  private sourceAdd(operation: AddRowOperation) {
    const sortedIndex = this.findSortedIndex(operation.index);
    ++this.movesToIgnore;
    this.translatedTable.moveRow(operation.index, sortedIndex);
    this.transactionLog.push(new AddRowOperation(sortedIndex));
  }

  private sourceMove(operation: MoveRowOperation) {
    if(this.movesToIgnore > 0) {
      --this.movesToIgnore;
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
        this.compareRows(source - 1, source) > 0) {
      return this.findInHead(0, source - 1, source);
    } else if(source !== this.rowCount - 1 &&
        this.compareRows(source, source + 1) > 0) {
      return this.findInTail(source + 1, this.rowCount - 1, source);
    } else {
      return source;
    }
  }

  private findInHead(start: number, end: number, indexOfValue: number) {
    while(start < end) {
      const middle = Math.floor((start + ((end - start) / 2)));
      if(this.compareRows(middle, indexOfValue) > 0) {
        end = middle;
      } else {
        start = middle + 1;
      }
    }
    return end;
  }

  private findInTail(start: number, end: number, indexOfValue: number) {
    while(start < end) {
      const middle = Math.ceil((start + ((end - start) / 2)));
      if(this.compareRows(indexOfValue, middle) > 0) {
        start = middle;
      } else {
        end = middle - 1;
      }
    }
    return start;
  }

  private comparator: Comparator;
  private movesToIgnore: number;
  private sortPriority: number[];
  private transactionLog: TransactionLog;
  private sortOrder: SortOrder[];
  private translatedTable: TranslatedTableModel;
}
