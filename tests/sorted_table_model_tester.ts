import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, SortedTableModel, Transaction,
  UpdateOperation} from '../source';

function getTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([1, 2, 12, 21]);
  matrix.push([3, 4, 34, 43]);
  matrix.push([5, 6, 56, 65]);
  return matrix;
}

/** Tests the SortedTableModel. */
export class SortedTableModelTester {

  /** Tests creating a empty SortedTableModel. */
  @Test()
  public testEmpty(): void {
    const sortedModel = new SortedTableModel(new ArrayTableModel());
    Expect(sortedModel.rowCount).toEqual(0);
    Expect(sortedModel.columnCount).toEqual(0);
  }

  /** Tests creating a SortedTableModel. */
  @Test()
  public testArrayTableWrap(): void {
    const sortedModel = new SortedTableModel(getTestTable());
    Expect(sortedModel.rowCount).toEqual(3);
    Expect(sortedModel.columnCount).toEqual(4);
  }
}
