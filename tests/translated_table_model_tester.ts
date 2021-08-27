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

  /** Tests moving rows. */
  @Test()
  public testMove(): void {
    const testTable = getTestTable();
    const operations: Operation[] = [];
    const listener = testTable.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => testTable.move(5, 2)).toThrow();
    Expect(() => testTable.move(4, 5)).toThrow();
    Expect(() => testTable.move(-2, 4)).toThrow();
    Expect(() => testTable.move(2, -4)).toThrow();
    Expect(() => testTable.move(0, 2)).not.toThrow();
    Expect(testTable.get(0, 0)).toEqual(3);
    Expect(testTable.get(0, 1)).toEqual(4);
    Expect(testTable.get(1, 0)).toEqual(5);
    Expect(testTable.get(1, 1)).toEqual(6);
    Expect(testTable.get(2, 0)).toEqual(1);
    Expect(testTable.get(2, 1)).toEqual(2);
    const firstOperation = operations.pop() as MoveRowOperation;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.source).toEqual(0);
    Expect(firstOperation.destination).toEqual(2);
    Expect(() => testTable.move(1, 0)).not.toThrow();
    Expect(testTable.get(0, 0)).toEqual(5);
    Expect(testTable.get(0, 1)).toEqual(6);
    Expect(testTable.get(1, 0)).toEqual(3);
    Expect(testTable.get(1, 1)).toEqual(4);
    Expect(testTable.get(2, 0)).toEqual(1);
    Expect(testTable.get(2, 1)).toEqual(2);
    const secondOperation = operations.pop() as MoveRowOperation;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.source).toEqual(1);
    Expect(secondOperation.destination).toEqual(0);
    listener.unlisten();
  }
}
