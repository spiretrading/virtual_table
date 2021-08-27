import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, Transaction, TranslatedTableModel, UpdateOperation} from
  '../source';

function getTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([1, 2]);
  matrix.push([3, 4]);
  matrix.push([5, 6]);
  return matrix;
}

/** Tests the TranslatedTableModel. */
export class TranslatedTableModelTester {

  /** Tests copying of source. */
  @Test()
  public testCopy(): void {
    const testTable = getTestTable();
    const translatedTable = new TranslatedTableModel(testTable);
    Expect(translatedTable.rowCount).toEqual(testTable.rowCount);
    Expect(translatedTable.columnCount).toEqual(testTable.columnCount);
    Expect(translatedTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedTable.get(0, 1)).toEqual(testTable.get(0, 1));
    Expect(translatedTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedTable.get(1, 1)).toEqual(testTable.get(1, 1));
    Expect(translatedTable.get(2, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedTable.get(2, 1)).toEqual(testTable.get(2, 1));
  }
}
