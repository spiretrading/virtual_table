import * as Kola from 'kola-signals';
import { Comparator } from './comparator';
import { HeaderCell } from './header_cell';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, UpdateOperation} from './operations';
import { SortOrder } from './sort_order';
import {TableModel} from './table_model';
import {TransactionLog} from './transaction_log';
import {TranslatedTableModel} from './translated_table_model';

export class SortedTableModel extends TableModel {

  /**
   * Constructs a model adapting an existing TableModel.
   * @param model The TableModel to adapt.
   */
  constructor(model: TableModel, sortOrders?: SortOrder[], comparator?: Comparator) {
    super();
    this.translatedTable = new TranslatedTableModel(model);
    if(comparator) {
      this.comparator = comparator;
    } else {
      this.comparator = new Comparator();
    }
    if(sortOrders === undefined) {
      this.sortOrder = [];
      for(let i = 0; i < model.columnCount; ++i) {
        this.sortOrder.push(SortOrder.NONE);
      }
    } else {
      this.sortOrder = sortOrders;
    }
    this.sortPriority = [];
  }

  public get rowCount(): number {
    return this.translatedTable.rowCount;
  }

  public get columnCount(): number {
    return this.translatedTable.columnCount;
  }

  public get lastSortedColumnIndex(): number | null {
    if(this.sortPriority.length > 0) {
      return this.sortPriority[0]
    } else {
      return null;
    }
  }

  public get(row: number, column: number) {
    return this.translatedTable.get(row, column);
  }

  public connect(slot: (operation: Operation) => void): 
      Kola.Listener<Operation> {
    throw new Error('Method not implemented.');
  }

  public sortAscending(column: number) {
    this.sortOrder[column] = SortOrder.ASCENDING;
    this.sort(column);
  }

  public sortDescending(column: number) {
    this.sortOrder[column] = SortOrder.DESCENDING;
    this.sort(column);
  }

  private sort(column: number) {
    const rowOrdering = [];
    for(let i = 0; i < this.translatedTable.rowCount; ++i) {
      rowOrdering.push(i);
    }
    rowOrdering.sort((a, b) => this.compareRows(column, a, b));
    for(let i = 0; i < rowOrdering.length; ++i) {
      this.translatedTable.moveRow(rowOrdering[i], i);
      for(let j = i + 1; j < rowOrdering.length; ++j) {
        if(rowOrdering[j] < rowOrdering[i]) {
          ++rowOrdering[j];
        }
      }
    }
    if(this.sortPriority.includes(column)) {
      this.sortPriority.splice(this.sortPriority.indexOf(column), 1).unshift(
        column);
    } else {
      this.sortPriority.unshift(column);
    }
  }

  private compareRows(column: number, row1: number, row2: number) {
    const value = this.comparator.compareValues(
      this.translatedTable.get(row1, column),
      this.translatedTable.get(row2, column));
      if(value !== 0) {
        if(this.sortOrder[column] === SortOrder.ASCENDING) {
          return value;
        } else {
          return -value;
        }
      }
    return 0;
  }

  private comparator: Comparator;
  private translatedTable: TranslatedTableModel;
  private sortOrder: SortOrder[];
  private sortPriority: number[];
}
