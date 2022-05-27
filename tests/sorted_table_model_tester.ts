import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, SortedTableModel, SortOrder, Transaction,
  UpdateOperation} from '../source';

function getTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([100, 2]);
  matrix.push([3, 4]);
  matrix.push([55, 7]);
  matrix.push([55, 6]);
  return matrix;
}

function getWideTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push(['w', 2, 3, 22]);
  matrix.push(['b', 2, 4, 45]);
  matrix.push(['a', 1, 4, -57]);
  matrix.push(['b', 1, 4, 0]);
  return matrix;
}

/** Tests the SortedTableModel. */
export class SortedTableModelTester {

  /** Tests creating a empty SortedTableModel. */
  @Test()
  public testEmptyTable(): void {
    const sortedModel = new SortedTableModel(new ArrayTableModel());
    Expect(sortedModel.rowCount).toEqual(0);
    Expect(sortedModel.columnCount).toEqual(0);
  }

  /** Tests creating a SortedTableModel. */
  @Test()
  public testTable(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    Expect(sortedModel.rowCount).toEqual(4);
    Expect(sortedModel.columnCount).toEqual(2);
  }

  /** Tests sorting by Ascending order. */
  @Test()
  public testAscendingSort(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    Expect(sortedModel.get(0, 0)).toEqual(3);
    Expect(sortedModel.get(1, 0)).toEqual(55);
    Expect(sortedModel.get(2, 0)).toEqual(55);
    Expect(sortedModel.get(3, 0)).toEqual(100);
  }

  /** Tests sorting by Descending order. */
  @Test()
  public testDescendingSort(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    sortedModel.updateSort(0, SortOrder.DESCENDING);
    Expect(sortedModel.get(0, 0)).toEqual(100);
    Expect(sortedModel.get(1, 0)).toEqual(55);
    Expect(sortedModel.get(2, 0)).toEqual(55);
    Expect(sortedModel.get(3, 0)).toEqual(3);
  }

  @Test()
  public testSortOnDifferentColumn(): void {
    const sortedModel = new SortedTableModel(getWideTestTable());
    sortedModel.updateSort(3, SortOrder.DESCENDING);
    Expect(sortedModel.get(0, 3)).toEqual(45);
    Expect(sortedModel.get(1, 3)).toEqual(22);
    Expect(sortedModel.get(2, 3)).toEqual(0);
    Expect(sortedModel.get(3, 3)).toEqual(-57);
  }

  /** Tests sorting with priority. */
  @Test()
  public testPrioritySort(): void {
    const sortedModel = new SortedTableModel(getWideTestTable());
    sortedModel.updateSort(3, SortOrder.DESCENDING);
    Expect(sortedModel.get(0, 3)).toEqual(45);
    Expect(sortedModel.get(1, 3)).toEqual(22);
    Expect(sortedModel.get(2, 3)).toEqual(0);
    Expect(sortedModel.get(3, 3)).toEqual(-57);
    sortedModel.updateSort(1, SortOrder.ASCENDING);
    Expect(sortedModel.get(0, 1)).toEqual(1);
    Expect(sortedModel.get(1, 1)).toEqual(1);
    Expect(sortedModel.get(2, 1)).toEqual(2);
    Expect(sortedModel.get(3, 1)).toEqual(2);
    Expect(sortedModel.get(0, 3)).toEqual(0);
    Expect(sortedModel.get(1, 3)).toEqual(-57);
    Expect(sortedModel.get(2, 3)).toEqual(45);
    Expect(sortedModel.get(3, 3)).toEqual(22);
  }

  /** Tests sorting with priority using sortColumns. */
  @Test()
  public testSortColumns(): void {
    const sortedModel = new SortedTableModel(getWideTestTable());
    const sortOrder = [
      SortOrder.NONE,
      SortOrder.ASCENDING,
      SortOrder.UNSORTABLE,
      SortOrder.DESCENDING];
    sortedModel.sortColumns(sortOrder, [1, 3])
    Expect(sortedModel.get(0, 1)).toEqual(1);
    Expect(sortedModel.get(1, 1)).toEqual(1);
    Expect(sortedModel.get(2, 1)).toEqual(2);
    Expect(sortedModel.get(3, 1)).toEqual(2);
    Expect(sortedModel.get(0, 3)).toEqual(0);
    Expect(sortedModel.get(1, 3)).toEqual(-57);
    Expect(sortedModel.get(2, 3)).toEqual(45);
    Expect(sortedModel.get(3, 3)).toEqual(22);
  }

  /** Tests that table stays sorted when source adds a new row. */
  @Test()
  public testSourceAdd(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    Expect(() => sourceTable.insert([9, 8], 0)).not.toThrow();
    Expect(sortedModel.get(0, 0)).toEqual(3);
    Expect(sortedModel.get(1, 0)).toEqual(9);
    Expect(sortedModel.get(2, 0)).toEqual(55);
    Expect(sortedModel.get(3, 0)).toEqual(55);
    Expect(sortedModel.get(4, 0)).toEqual(100);
    Expect(sortedModel.rowCount).toEqual(5);
  }

  /** Tests that table stays sorted when a source removes row. */
  @Test()
  public testSourceRemove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    Expect(() => sourceTable.remove(1)).not.toThrow();
    Expect(sortedModel.get(0, 0)).toEqual(55);
    Expect(sortedModel.get(1, 0)).toEqual(55);
    Expect(sortedModel.get(2, 0)).toEqual(100);
    Expect(sortedModel.rowCount).toEqual(3);
  }

  /** Tests that table stays sorted when source updates a row. */
  @Test()
  public testSourceUpdate(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    Expect(() => sourceTable.set(3, 0, 2)).not.toThrow();
    Expect(sortedModel.get(0, 0)).toEqual(2);
    Expect(sortedModel.get(1, 0)).toEqual(3);
    Expect(sortedModel.get(2, 0)).toEqual(55);
    Expect(sortedModel.get(3, 0)).toEqual(100);
    Expect(sortedModel.rowCount).toEqual(4);
  }

  /** Tests that table stays sorted when source moves a row. */
  @Test()
  public testSourceMove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    sourceTable.move(0, 3);
    Expect(sortedModel.get(0, 0)).toEqual(3);
    Expect(sortedModel.get(1, 0)).toEqual(55);
    Expect(sortedModel.get(2, 0)).toEqual(55);
    Expect(sortedModel.get(3, 0)).toEqual(100);
  }

  /** Tests the signal SortedTable sends on a source add. */
  @Test()
  public testSourceAddSignal(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    const operations: Operation[] = [];
    const listener = sortedModel.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => sourceTable.insert([9, 8], 0)).not.toThrow();
    Expect(operations.length).toEqual(1);
    const addOperation = operations.pop() as AddRowOperation;
    Expect(addOperation).not.toBeNull();
    Expect(addOperation.index).toEqual(1);
    listener.unlisten();
  }

  /** Tests the signal SortedTable sends on a source remove. */
  @Test()
  public testSourceRemoveSignal(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    const operations: Operation[] = [];
    const listener = sortedModel.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => sourceTable.remove(1)).not.toThrow();
    Expect(operations.length).toEqual(1);
    const operation = operations.pop() as RemoveRowOperation;
    Expect(operation).not.toBeNull();
    Expect(operation.index).toEqual(0);
    listener.unlisten();
  }

  /** Tests the signal SortedTable sends on a source update. */
  @Test()
  public testSourceUpdateSignal(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    const operations: Operation[] = [];
    const listener = sortedModel.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => sourceTable.set(0, 0, 0)).not.toThrow();
    const transaction = operations.pop() as Transaction;
    Expect(transaction).not.toBeNull();
    Expect(transaction.operations.length).toEqual(2);
    const secondOperation = transaction.operations[0] as MoveRowOperation;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.source).toEqual(3);
    Expect(secondOperation.destination).toEqual(0);
    const firstOperation = transaction.operations[1] as UpdateOperation;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.row).toEqual(0);
    listener.unlisten();
  }
}
