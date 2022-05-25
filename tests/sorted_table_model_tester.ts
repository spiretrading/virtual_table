import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, SortedTableModel, Transaction,
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
  matrix.push(['w', 2, 3, 23]);
  matrix.push(['b', 2, 4, 45]);
  matrix.push(['h', 2, 1, 0]);
  matrix.push(['a', 2, 1, -57]);
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
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.sortAscending(0);
    Expect(sortedModel.get(0, 0)).toEqual(sourceTable.get(1, 0));
    Expect(sortedModel.get(1, 0)).toEqual(sourceTable.get(2, 0));
    Expect(sortedModel.get(2, 0)).toEqual(sourceTable.get(3, 0));
    Expect(sortedModel.get(3, 0)).toEqual(sourceTable.get(0, 0));
    Expect(sortedModel.lastSortedColumnIndex).toEqual(0);
  }

  /** Tests sorting by Descending order. */
  @Test()
  public testDescendingSort(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.sortDescending(0);
    Expect(sortedModel.get(0, 0)).toEqual(sourceTable.get(0, 0));
    Expect(sortedModel.get(1, 0)).toEqual(sourceTable.get(3, 0));
    Expect(sortedModel.get(2, 0)).toEqual(sourceTable.get(2, 0));
    Expect(sortedModel.get(3, 0)).toEqual(sourceTable.get(1, 0));
    Expect(sortedModel.lastSortedColumnIndex).toEqual(0);
  }

  /** Tests link to add operations from source. */
  @Test()
  public testSourceAdd(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.sortAscending(0);
    Expect(() => sourceTable.insert([9, 8], 0)).not.toThrow();
    Expect(sortedModel.get(0, 0)).toEqual(sourceTable.get(2, 0));
    Expect(sortedModel.get(1, 0)).toEqual(sourceTable.get(0, 0));
    Expect(sortedModel.get(2, 0)).toEqual(sourceTable.get(3, 0));
    Expect(sortedModel.get(3, 0)).toEqual(sourceTable.get(4, 0));
    Expect(sortedModel.get(4, 0)).toEqual(sourceTable.get(1, 0));
  }

  /** Tests link to remove operations from source. */
  @Test()
  public testSourceRemove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.sortAscending(0);
    Expect(() => sourceTable.remove(1)).not.toThrow();
    Expect(sortedModel.get(0, 0)).toEqual(sourceTable.get(1, 0));
    Expect(sortedModel.get(1, 0)).toEqual(sourceTable.get(2, 0));
    Expect(sortedModel.get(2, 0)).toEqual(sourceTable.get(0, 0));
  }

  /** Tests link to update operations from source. */
  @Test()
  public testSourceUpdate(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.sortAscending(0);
    Expect(() => sourceTable.set(3, 0, 2)).not.toThrow();
    Expect(sortedModel.get(0, 0)).toEqual(sourceTable.get(3, 0));
    Expect(sortedModel.get(1, 0)).toEqual(sourceTable.get(1, 0));
    Expect(sortedModel.get(2, 0)).toEqual(sourceTable.get(2, 0));
    Expect(sortedModel.get(3, 0)).toEqual(sourceTable.get(0, 0));
  }

  /** Tests link to remove operations from source. */
  @Test()
  public testSourceMove(): void {
    const sourceTable = getTestTable();
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.sortAscending(0);
    Expect(() => sourceTable.move(0, 1)).not.toThrow();
    Expect(sortedModel.get(0, 0)).toEqual(sourceTable.get(0, 0));
    Expect(sortedModel.get(1, 0)).toEqual(sourceTable.get(2, 0));
    Expect(sortedModel.get(2, 0)).toEqual(sourceTable.get(3, 0));
    Expect(sortedModel.get(3, 0)).toEqual(sourceTable.get(1, 0));
  } 
}
