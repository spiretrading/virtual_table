import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, SortedTableModel, SortOrder, TableModel, Transaction,
  UpdateOperation} from '../source';

function getTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([100, 2]);
  matrix.push([3, 4]);
  matrix.push([55, 7]);
  matrix.push([55, 6]);
  return matrix;
}

function getSingleDigitTable() {
  const matrix = new ArrayTableModel();
  matrix.push([1, 2]);
  matrix.push([3, 4]);
  matrix.push([5, 7]);
  matrix.push([5, 6]);
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

function areCellsEqual(table: TableModel, expectedTable: any[][]) {
  for(let i = 0; i < table.rowCount; ++i) {
    for(let j = 0; j < table.columnCount; ++j) {
      if(table.get(i, j) !== expectedTable[i][j]) {
        throw new Error(`Checking row: ${i} column: ${j}.\n
          The expected value ${expectedTable[i][j]}.\n
          Actual value ${table.get(i, j)}.`);
      }
    }
  }
  return true;
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

  /** Tests areCellsEqual which is used by other tests. */
  @Test()
  public areCellsEqual(): void {
    const table = getTestTable();
    const expectedTable = [
      [100, 2],
      [3, 4],
      [55, 7],
      [55, 6]
    ];
    Expect(areCellsEqual(table, expectedTable)).toEqual(true);
    Expect(() => areCellsEqual(getSingleDigitTable(), expectedTable)).toThrow();
  }

  /** Tests creating a SortedTableModel. */
  @Test()
  public testTable(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    const expectedTable = [
      [100, 2],
      [3, 4],
      [55, 7],
      [55, 6]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
    Expect(sortedModel.rowCount).toEqual(4);
    Expect(sortedModel.columnCount).toEqual(2);
  }

  /** Tests sorting by Ascending order. */
  @Test()
  public testAscendingSort(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    const expectedTable = [
      [3, 4],
      [55, 7],
      [55, 6],
      [100, 2]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
    Expect(sortedModel.rowCount).toEqual(4);
    Expect(sortedModel.columnCount).toEqual(2);
  }

  /** Tests sorting by Descending order. */
  @Test()
  public testDescendingSort(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    sortedModel.updateSort(0, SortOrder.DESCENDING);
    const expectedTable = [
      [100, 2],
      [55, 7],
      [55, 6],
      [3, 4],
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
    Expect(sortedModel.rowCount).toEqual(4);
    Expect(sortedModel.columnCount).toEqual(2);
  }

  /** Tests sorting by Descending on a different table. */
  @Test()
  public testSortOnDifferentColumn(): void {
    const sortedModel = new SortedTableModel(getWideTestTable());
    sortedModel.updateSort(3, SortOrder.DESCENDING);
    const expectedTable = [
      ['b', 2, 4, 45],
      ['w', 2, 3, 22],
      ['b', 1, 4, 0],
      ['a', 1, 4, -57],
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
  }

  /** Tests sorting with priority. */
  @Test()
  public testPrioritySort(): void {
    const sortedModel = new SortedTableModel(getWideTestTable());
    sortedModel.updateSort(3, SortOrder.DESCENDING);
    sortedModel.updateSort(1, SortOrder.ASCENDING);
    const expectedTable = [
      ['b', 1, 4, 0],
      ['a', 1, 4, -57],
      ['b', 2, 4, 45],
      ['w', 2, 3, 22]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
  }

  /** Tests sorting with priority. */
  @Test()
  public testPrioritySortAgain(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(1, SortOrder.DESCENDING);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    const expectedTable = [
      [1, 2],
      [3, 4],
      [5, 7],
      [5, 6]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
  }

  /** Tests sorting on a empty table. */
  @Test()
  public testEmptySort(): void {
    const sortedModel = new SortedTableModel(new ArrayTableModel());
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    const expectedTable = [] as any[];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
  }

  /** Tests that table stays sorted when source adds a new row. */
  @Test()
  public testSourceAdd(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(1, SortOrder.DESCENDING);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    sourceTable.insert([0, 7], 4);
    const expectedTable = [
      [0, 7],
      [1, 2],
      [3, 4],
      [5, 7],
      [5, 6]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
    Expect(sortedModel.rowCount).toEqual(5);
  }

  /** Tests that table stays sorted when source adds many new rows. */
  @Test()
  public testSourceManyAdd(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(1, SortOrder.DESCENDING);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    sourceTable.insert([0, 7], 0);
    sourceTable.insert([2, 2], 4);
    sourceTable.insert([1, 4], 4);
    sourceTable.insert([3, 5], 4);
    sourceTable.insert([7, 7], 4);
    sourceTable.insert([0, 0], 4);
    const expectedTable = [
      [0, 0],
      [0, 7],
      [1, 4],
      [1, 2],
      [2, 2],
      [3, 5],
      [3, 4],
      [5, 7],
      [5, 6],
      [7, 7]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
  }

  /** Tests that table stays sorted when the source table removes a row. */
  @Test()
  public testSourceRemove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(1, SortOrder.DESCENDING);
    sourceTable.remove(1);
    sourceTable.remove(0);
    const expectedTable = [
      [55, 7],
      [55, 6]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
    Expect(sortedModel.rowCount).toEqual(2);
  }

  /** Tests that table stays sorted when source updates a row. */
  @Test()
  public testSourceUpdate(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(1, SortOrder.DESCENDING);
    sortedModel.updateSort(0, SortOrder.ASCENDING);
    sourceTable.insert([0, 7], 0);
    sourceTable.insert([2, 2], 4);
    sourceTable.insert([1, 4], 4);
    sourceTable.insert([3, 5], 4);
    sourceTable.insert([7, 7], 4);
    sourceTable.insert([0, 0], 4);
    sourceTable.set(0, 0, 7);
    sourceTable.set(4, 0, 4);
    sourceTable.set(0, 1, 9);
    const expectedTable = [
      [1, 4],
      [1, 2],
      [2, 2],
      [3, 5],
      [3, 4],
      [4, 0],
      [5, 7],
      [5, 6],
      [7, 9],
      [7, 7]
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
  }

  /** Tests that table stays sorted when source moves a row. */
  @Test()
  public testSourceMove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSort(0, SortOrder.DESCENDING);
    sourceTable.move(0, 3);
    sourceTable.move(1, 2);
    sourceTable.move(0, 2);
    const expectedTable = [
      [100, 2],
      [55, 7],
      [55, 6],
      [3, 4],
    ];
    Expect(areCellsEqual(sortedModel, expectedTable)).toEqual(true);
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

  public testAddAndSorting(): void {
  }
}
