import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, Transaction, TranslatedColumnModel, UpdateOperation} from
  '../source';


function getTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([1, 2]);
  matrix.push([3, 4]);
  matrix.push([5, 6]);
  return matrix;
}


function getWideTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([0, 1, 2, 3, 4]);
  matrix.push([5, 6, 7, 8, 9]);
  matrix.push([10, 11, 12, 13, 14]);
  return matrix;
}


export class TranslatedColumnModelTester {


  /** Tests mode constructor */
  @Test()
  public testCopy(): void {
    const testTable = getTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    Expect(translatedColumnTable.rowCount).toEqual(testTable.rowCount);
    Expect(translatedColumnTable.columnCount).toEqual(testTable.columnCount);
    Expect(translatedColumnTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedColumnTable.get(0, 1)).toEqual(testTable.get(0, 1));
    Expect(translatedColumnTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedColumnTable.get(1, 1)).toEqual(testTable.get(1, 1));
    Expect(translatedColumnTable.get(2, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedColumnTable.get(2, 1)).toEqual(testTable.get(2, 1));
  }


  /** Tests moving columns that don't exist. */
  @Test()
  public testInvalidMove(): void {
    const testTable = getTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    Expect(() => translatedColumnTable.moveColumn(0, 8)).toThrow();
    Expect(() => translatedColumnTable.moveColumn(0, -8)).toThrow();
    Expect(() => translatedColumnTable.moveColumn(4, -8)).toThrow();
    Expect(() => translatedColumnTable.moveColumn(8, 8)).toThrow();
  }


  /** Tests a move on a table with only two columns. */
  @Test()
  public testTwoColumnTableMove(): void {
    const testTable = getTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    translatedColumnTable.moveColumn(0, 1);
    Expect(translatedColumnTable.columnCount).toEqual(2);
    Expect(translatedColumnTable.rowCount).toEqual(3);
    Expect(translatedColumnTable.get(0, 0)).toEqual(testTable.get(0, 1));
    Expect(translatedColumnTable.get(0, 1)).toEqual(testTable.get(0, 0));
    Expect(translatedColumnTable.get(1, 0)).toEqual(testTable.get(1, 1));
    Expect(translatedColumnTable.get(1, 1)).toEqual(testTable.get(1, 0));
    Expect(translatedColumnTable.get(2, 0)).toEqual(testTable.get(2, 1));
    Expect(translatedColumnTable.get(2, 1)).toEqual(testTable.get(2, 0));
  }


  /** Tests moving the column and then undoing the move. */
  @Test()
  public testMoveThereAndBack(): void {
    const testTable = getTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    translatedColumnTable.moveColumn(0, 1);
    translatedColumnTable.moveColumn(0, 1);
    Expect(translatedColumnTable.columnCount).toEqual(2);
    Expect(translatedColumnTable.rowCount).toEqual(3);
    Expect(translatedColumnTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedColumnTable.get(0, 1)).toEqual(testTable.get(0, 1));
    Expect(translatedColumnTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedColumnTable.get(1, 1)).toEqual(testTable.get(1, 1));
    Expect(translatedColumnTable.get(2, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedColumnTable.get(2, 1)).toEqual(testTable.get(2, 1));
  }


  /** Tests moving a column to the left of the source. */
  @Test()
  public testMoveLeft(): void {
    const testTable = getWideTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    translatedColumnTable.moveColumn(3, 0);
    Expect(translatedColumnTable.columnCount).toEqual(5);
    Expect(translatedColumnTable.rowCount).toEqual(3);
    Expect(translatedColumnTable.get(0, 0)).toEqual(testTable.get(0, 3));
    Expect(translatedColumnTable.get(1, 0)).toEqual(testTable.get(1, 3));
    Expect(translatedColumnTable.get(2, 0)).toEqual(testTable.get(2, 3));
    Expect(translatedColumnTable.get(0, 1)).toEqual(testTable.get(0, 0));
    Expect(translatedColumnTable.get(1, 1)).toEqual(testTable.get(1, 0));
    Expect(translatedColumnTable.get(2, 1)).toEqual(testTable.get(2, 0));
    Expect(translatedColumnTable.get(0, 2)).toEqual(testTable.get(0, 1));
    Expect(translatedColumnTable.get(1, 2)).toEqual(testTable.get(1, 1));
    Expect(translatedColumnTable.get(2, 2)).toEqual(testTable.get(2, 1));
    Expect(translatedColumnTable.get(0, 3)).toEqual(testTable.get(0, 2));
    Expect(translatedColumnTable.get(1, 3)).toEqual(testTable.get(1, 2));
    Expect(translatedColumnTable.get(2, 3)).toEqual(testTable.get(2, 2));
    Expect(translatedColumnTable.get(0, 4)).toEqual(testTable.get(0, 4));
    Expect(translatedColumnTable.get(1, 4)).toEqual(testTable.get(1, 4));
    Expect(translatedColumnTable.get(2, 4)).toEqual(testTable.get(2, 4));
  }


  /** Tests moving a column to the right of the source. */
  @Test()
  public testMoveRight(): void {
    const testTable = getWideTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    translatedColumnTable.moveColumn(1, 4);
    Expect(translatedColumnTable.columnCount).toEqual(5);
    Expect(translatedColumnTable.rowCount).toEqual(3);
    Expect(translatedColumnTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedColumnTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedColumnTable.get(2, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedColumnTable.get(0, 1)).toEqual(testTable.get(0, 2));
    Expect(translatedColumnTable.get(1, 1)).toEqual(testTable.get(1, 2));
    Expect(translatedColumnTable.get(2, 1)).toEqual(testTable.get(2, 2));
    Expect(translatedColumnTable.get(0, 2)).toEqual(testTable.get(0, 3));
    Expect(translatedColumnTable.get(1, 2)).toEqual(testTable.get(1, 3));
    Expect(translatedColumnTable.get(2, 2)).toEqual(testTable.get(2, 3));
    Expect(translatedColumnTable.get(0, 3)).toEqual(testTable.get(0, 4));
    Expect(translatedColumnTable.get(1, 3)).toEqual(testTable.get(1, 4));
    Expect(translatedColumnTable.get(2, 3)).toEqual(testTable.get(2, 4));
    Expect(translatedColumnTable.get(0, 4)).toEqual(testTable.get(0, 1));
    Expect(translatedColumnTable.get(1, 4)).toEqual(testTable.get(1, 1));
    Expect(translatedColumnTable.get(2, 4)).toEqual(testTable.get(2, 1));
  }


  /** Tests moving when source and dest are the same. */
  @Test()
  public testMoveInPlace(): void {
    const testTable = getWideTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    translatedColumnTable.moveColumn(1, 1);
    Expect(translatedColumnTable.columnCount).toEqual(5);
    Expect(translatedColumnTable.rowCount).toEqual(3);
    Expect(translatedColumnTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedColumnTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedColumnTable.get(2, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedColumnTable.get(0, 1)).toEqual(testTable.get(0, 1));
    Expect(translatedColumnTable.get(1, 1)).toEqual(testTable.get(1, 1));
    Expect(translatedColumnTable.get(2, 1)).toEqual(testTable.get(2, 1));
    Expect(translatedColumnTable.get(0, 2)).toEqual(testTable.get(0, 2));
    Expect(translatedColumnTable.get(1, 2)).toEqual(testTable.get(1, 2));
    Expect(translatedColumnTable.get(2, 2)).toEqual(testTable.get(2, 2));
    Expect(translatedColumnTable.get(0, 3)).toEqual(testTable.get(0, 3));
    Expect(translatedColumnTable.get(1, 3)).toEqual(testTable.get(1, 3));
    Expect(translatedColumnTable.get(2, 3)).toEqual(testTable.get(2, 3));
    Expect(translatedColumnTable.get(0, 4)).toEqual(testTable.get(0, 4));
    Expect(translatedColumnTable.get(1, 4)).toEqual(testTable.get(1, 4));
    Expect(translatedColumnTable.get(2, 4)).toEqual(testTable.get(2, 4));
  }


  /** Tests several moves in a row. */
  @Test()
  public testSeveralMoves(): void {
    const testTable = getWideTestTable();
    const translatedColumnTable = new TranslatedColumnModel(testTable);
    translatedColumnTable.moveColumn(1, 3);
    translatedColumnTable.moveColumn(1, 4);
    translatedColumnTable.moveColumn(3, 0);
    Expect(translatedColumnTable.columnCount).toEqual(5);
    Expect(translatedColumnTable.rowCount).toEqual(3);
    Expect(translatedColumnTable.get(0, 0)).toEqual(testTable.get(0, 4));
    Expect(translatedColumnTable.get(1, 0)).toEqual(testTable.get(1, 4));
    Expect(translatedColumnTable.get(2, 0)).toEqual(testTable.get(2, 4));
    Expect(translatedColumnTable.get(0, 1)).toEqual(testTable.get(0, 0));
    Expect(translatedColumnTable.get(1, 1)).toEqual(testTable.get(1, 0));
    Expect(translatedColumnTable.get(2, 1)).toEqual(testTable.get(2, 0));
    Expect(translatedColumnTable.get(0, 2)).toEqual(testTable.get(0, 3));
    Expect(translatedColumnTable.get(1, 2)).toEqual(testTable.get(1, 3));
    Expect(translatedColumnTable.get(2, 2)).toEqual(testTable.get(2, 3));
    Expect(translatedColumnTable.get(0, 3)).toEqual(testTable.get(0, 1));
    Expect(translatedColumnTable.get(1, 3)).toEqual(testTable.get(1, 1));
    Expect(translatedColumnTable.get(2, 3)).toEqual(testTable.get(2, 1));
    Expect(translatedColumnTable.get(0, 4)).toEqual(testTable.get(0, 2));
    Expect(translatedColumnTable.get(1, 4)).toEqual(testTable.get(1, 2));
    Expect(translatedColumnTable.get(2, 4)).toEqual(testTable.get(2, 2));
  }
}