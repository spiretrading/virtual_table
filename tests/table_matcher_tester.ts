import {Test} from 'alsatian';
import {ArrayTableModel, TableModel} from '../source';
import {Expect} from '../test_helpers/table_matcher';

/** Test functions that are used by other tests. */
export class TestHelpersTester {

  /** Tests TableMatcher which is used by other tests. */
  @Test()
  public testToEqualCells(): void {
    const table = new ArrayTableModel();
    table.push([1, 2]);
    table.push([3, 4]);
    table.push([5, 6]);
    const expectedTable = [
      [1, 2],
      [3, 4],
      [5, 6]
    ];
    Expect(table).toEqualCells(expectedTable);
    const differentTable = [
      [1, 2],
      [1, -4],
      [0, -6]
    ];
    Expect(table).not.toEqualCells(differentTable);
    const tooShortTable = [
      [1, 2]
    ];
    Expect(table).not.toEqualCells(tooShortTable);
    const tooNarrowTable = [
      [1],
      [3],
      [5]
    ];
    Expect(table).not.toEqualCells(tooNarrowTable);
  }
}
