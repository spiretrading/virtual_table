import {Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, SortedTableModel, SortOrder, Transaction,
  UpdateOperation} from '../source';
import {Expect} from '../test_helpers/table_matcher';

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
  matrix.push(['b', 3, 4, 0]);
  matrix.push(['w', 2, 3, 22]);
  matrix.push(['b', 2, 4, 45]);
  matrix.push(['a', 1, 4, -57]);
  matrix.push(['b', 1, 4, 0]);
  matrix.push(['b', 2, 4, 0]);
  matrix.push(['w', 3, 10, -1]);
  return matrix;
}

function noDuplicateValuesTable() {
  const matrix = new ArrayTableModel();
  matrix.push([1, 6]);
  matrix.push([3, 7]);
  matrix.push([4, 8]);
  matrix.push([5, 9]);
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
    const expectedTable = [
      [100, 2],
      [3, 4],
      [55, 7],
      [55, 6]
    ];
    Expect(sortedModel).toEqual(expectedTable);
    Expect(sortedModel.rowCount).toEqual(4);
    Expect(sortedModel.columnCount).toEqual(2);
  }

  /** Tests sorting by Ascending order. */
  @Test()
  public testAscendingSort(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
    const expectedTable = [
      [3, 4],
      [55, 7],
      [55, 6],
      [100, 2]
    ];
    Expect(sortedModel).toEqual(expectedTable);
    Expect(sortedModel.rowCount).toEqual(4);
    Expect(sortedModel.columnCount).toEqual(2);
  }

  /** Tests sorting by Descending order. */
  @Test()
  public testDescendingSort(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    sortedModel.updateSortOrder(0, SortOrder.DESCENDING);
    const expectedTable = [
      [100, 2],
      [55, 7],
      [55, 6],
      [3, 4],
    ];
    Expect(sortedModel).toEqual(expectedTable);
    Expect(sortedModel.rowCount).toEqual(4);
    Expect(sortedModel.columnCount).toEqual(2);
  }

  /** Tests sorting with priority. */
  @Test()
  public testPrioritySort(): void {
    const sortedModel = new SortedTableModel(getWideTestTable());
    sortedModel.updateSortOrder(3, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(1, SortOrder.ASCENDING);
    sortedModel.updateSortOrder(3, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(1, SortOrder.ASCENDING);
    const expectedTable = [
      ['b', 1, 4, 0],
      ['a', 1, 4, -57],
      ['b', 2, 4, 45],
      ['w', 2, 3, 22],
      ['b', 2, 4, 0],
      ['b', 3, 4, 0],
      ['w', 3, 10, -1]
    ];
    Expect(sortedModel).toEqual(expectedTable);;
  }

  /** Tests sorting correctness after multiple priority changes. */
  @Test()
  public testPrioritySortAgain(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(0, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
    const expectedTable = [
      [1, 2],
      [3, 4],
      [5, 7],
      [5, 6]
    ];
    Expect(sortedModel).toEqual(expectedTable);
  }

  /** Tests sorting on a empty table. */
  @Test()
  public testEmptySort(): void {
    const sortedModel = new SortedTableModel(new ArrayTableModel());
    Expect(() => sortedModel.updateSortOrder(0, SortOrder.ASCENDING)).toThrow();
    const expectedTable = [] as any[];
    Expect(sortedModel).toEqual(expectedTable);
  }

  /** Tests that impossible sorts are prevented. */
  @Test()
  public testImpossibleSort(): void {
    const model = new SortedTableModel(getTestTable());
    Expect(() => model.updateSortOrder(10, SortOrder.ASCENDING)).toThrow();
    let expectedTable = [
      [100, 2],
      [3, 4],
      [55, 7],
      [55, 6]
    ];
    Expect(model).toEqual(expectedTable);
    model.updateSortOrder(1, SortOrder.DESCENDING);
    Expect(() => model.updateSortOrder(4, SortOrder.NONE)).toThrow();
    expectedTable = [
      [55, 7],
      [55, 6],
      [3, 4],
      [100, 2]
    ];
    Expect(model).toEqual(expectedTable);
  }

  /** 
   * Tests that sorting remains correct when columns are removed from the
   * sort priority.
   */
  @Test()
  public testSortRemoval(): void {
    const sortedModel = new SortedTableModel(noDuplicateValuesTable());
    sortedModel.updateSortOrder(1, SortOrder.NONE);
    sortedModel.updateSortOrder(0, SortOrder.UNSORTABLE);
    let expectedTable = [
      [1, 6],
      [3, 7],
      [4, 8],
      [5, 9]
    ];
    Expect(sortedModel).toEqual(expectedTable);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    expectedTable = [
      [5, 9],
      [4, 8],
      [3, 7],
      [1, 6]
    ];
    Expect(sortedModel).toEqual(expectedTable);
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
    sortedModel.updateSortOrder(0, SortOrder.NONE);
    expectedTable = [
      [5, 9],
      [4, 8],
      [3, 7],
      [1, 6]
    ];
    Expect(sortedModel).toEqual(expectedTable);
    sortedModel.updateSortOrder(1, SortOrder.UNSORTABLE);
    expectedTable = [
      [5, 9],
      [4, 8],
      [3, 7],
      [1, 6]
    ];
    Expect(sortedModel).toEqual(expectedTable);
  }

  /** Tests that getHighestPriorityColumn performs correctly. */
  public testHighestSortPriority(): void {
    const sortedModel = new SortedTableModel(noDuplicateValuesTable());
    sortedModel.updateSortOrder(1, SortOrder.NONE);
    sortedModel.updateSortOrder(0, SortOrder.UNSORTABLE);
    Expect(sortedModel.getHighestPriorityColumn()).toEqual(-1);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    Expect(sortedModel.getHighestPriorityColumn()).toEqual(1);
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
    Expect(sortedModel.getHighestPriorityColumn()).toEqual(0);
    sortedModel.updateSortOrder(0, SortOrder.NONE);
    Expect(sortedModel.getHighestPriorityColumn()).toEqual(1);
    sortedModel.updateSortOrder(1, SortOrder.UNSORTABLE);
    Expect(sortedModel.getHighestPriorityColumn()).toEqual(-1);
  }

  /** Tests that table stays sorted when source adds a new row. */
  @Test()
  public testSourceAdd(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
    sourceTable.insert([0, 7], 4);
    const expectedTable = [
      [0, 7],
      [1, 2],
      [3, 4],
      [5, 7],
      [5, 6]
    ];
    Expect(sortedModel).toEqual(expectedTable);
    Expect(sortedModel.rowCount).toEqual(5);
  }

  /** Tests that table stays sorted when source adds many new rows. */
  @Test()
  public testSourceManyAdd(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
    sourceTable.insert([0, 7], 0);
    sourceTable.insert([2, 2], 4);
    sourceTable.insert([1, 4], 4);
    sourceTable.insert([3, 5], 4);
    sourceTable.insert([7, 7], 4);
    sourceTable.insert([0, 0], 1);
    const expectedTable = [
      [0, 7],
      [0, 0],
      [1, 4],
      [1, 2],
      [2, 2],
      [3, 5],
      [3, 4],
      [5, 7],
      [5, 6],
      [7, 7]
    ];
    Expect(sortedModel).toEqual(expectedTable);
  }

  /** Tests that table stays sorted when the source table removes a row. */
  @Test()
  public testSourceRemove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    sourceTable.remove(1);
    sourceTable.remove(0);
    const expectedTable = [
      [55, 7],
      [55, 6]
    ] as any [];
    Expect(sortedModel).toEqual(expectedTable);
    Expect(sortedModel.rowCount).toEqual(2);
    sourceTable.remove(0);
    sourceTable.remove(0);
    Expect(sortedModel).toEqual([]);
    Expect(sortedModel.rowCount).toEqual(0);
  }

  /** Tests that table stays sorted when source updates a row. */
  @Test()
  public testSourceUpdate(): void {
    const sourceTable = getSingleDigitTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSortOrder(1, SortOrder.DESCENDING);
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
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
    Expect(sortedModel).toEqual(expectedTable);
  }

  /** Tests that table stays sorted when source moves a row. */
  @Test()
  public testSourceMove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSortOrder(0, SortOrder.DESCENDING);
    sourceTable.move(0, 3);
    sourceTable.move(1, 2);
    sourceTable.move(0, 2);
    const expectedTable = [
      [100, 2],
      [55, 7],
      [55, 6],
      [3, 4],
    ];
    Expect(sortedModel).toEqual(expectedTable);
  }

  /** Tests the signal SortedTable sends on a source add. */
  @Test()
  public testSourceAddSignal(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
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
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
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
    sortedModel.updateSortOrder(0, SortOrder.ASCENDING);
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
