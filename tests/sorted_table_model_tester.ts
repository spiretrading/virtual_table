import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, SortedTableModel, Transaction,
  UpdateOperation} from '../source';

function getTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([100, 2]);
  matrix.push([3, 4]);
  matrix.push([55, 7]);
  matrix.push([56, 6]);
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
    const sourceTable = getTestTable()
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
    const sourceTable = getTestTable()
    const sortedModel = new SortedTableModel(sourceTable);
    sortedModel.sortAscending(0);
    Expect(sortedModel.get(0, 0)).toEqual(sourceTable.get(0, 0));
    Expect(sortedModel.get(1, 0)).toEqual(sourceTable.get(3, 0));
    Expect(sortedModel.get(2, 0)).toEqual(sourceTable.get(2, 0));
    Expect(sortedModel.get(3, 0)).toEqual(sourceTable.get(1, 0));
    Expect(sortedModel.lastSortedColumnIndex).toEqual(0);
  }
}
