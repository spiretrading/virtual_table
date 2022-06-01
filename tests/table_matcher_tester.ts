import {Focus, Test} from 'alsatian';
import {ArrayTableModel, TableModel} from '../source';
import {Expect} from '../test_helpers/table_matcher';

/** Test TableMatcher */
export class TestTableMatcher {

  /** Tests when actualValue is TableModel and expected is a 2D array. */
  @Test()
  public testToEqualTableArray(): void {
    const table = new ArrayTableModel();
    Expect(table).toEqual([]);
    table.push([1, 2]);
    table.push([3, 4]);
    table.push([5, 6]);
    const expectedTable = [
      [1, 2],
      [3, 4],
      [5, 6]
    ];
    Expect(table).toEqual(expectedTable);
    const differentTable = [
      [1, 2],
      [1, -4],
      [0, -6]
    ];
    Expect(table).not.toEqual(differentTable);
    const tooShortTable = [
      [1, 2]
    ];
    Expect(table).not.toEqual(tooShortTable);
    const tooNarrowTable = [
      [1],
      [3],
      [5]
    ];
    Expect(table).not.toEqual(tooNarrowTable);
  }

  /** Tests when actualValue is TableModel and expected is also a TableModel. */
  public testToEqualTable(): void {
    const table = new ArrayTableModel();
    Expect(table).toEqual(table);
    table.push([1, 2]);
    table.push([3, 4]);
    table.push([5, 6]);
    Expect(table).toEqual(table);
    const differentTable = new ArrayTableModel();
    differentTable.push([1, 2]);
    differentTable.push([1, 4]);
    differentTable.push([0, -6]);
    Expect(table).not.toEqual(differentTable);
    const tooShortTable = new ArrayTableModel();
    tooShortTable.push([1, 2]);
    Expect(table).not.toEqual(tooShortTable);
    const tooNarrowTable = new ArrayTableModel();
    tooNarrowTable.push([1]);
    tooNarrowTable.push([2]);
    tooNarrowTable.push([3]);
    Expect(table).not.toEqual(tooNarrowTable);
  }

  /** Tests that toEqual works if actualValue is not a TableModel. */
  public testsToEqual(): void {
    Expect(0).toEqual(0);
    Expect(true).toEqual(true);
    Expect(true).not.toEqual(false);
    Expect(1+1).toEqual(2);
    Expect([1, 2]).not.toEqual([2, 1]);
    Expect('something').toEqual('something');
  }
}
