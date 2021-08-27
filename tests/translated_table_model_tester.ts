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
    const translatedTable = new TranslatedTableModel(testTable);
    const operations: Operation[] = [];
    const listener = translatedTable.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => translatedTable.moveRow(5, 2)).toThrow();
    Expect(() => translatedTable.moveRow(4, 5)).toThrow();
    Expect(() => translatedTable.moveRow(-2, 4)).toThrow();
    Expect(() => translatedTable.moveRow(2, -4)).toThrow();
    Expect(() => translatedTable.moveRow(0, 2)).not.toThrow();
    Expect(translatedTable.get(0, 0)).toEqual(3);
    Expect(translatedTable.get(0, 1)).toEqual(4);
    Expect(translatedTable.get(1, 0)).toEqual(5);
    Expect(translatedTable.get(1, 1)).toEqual(6);
    Expect(translatedTable.get(2, 0)).toEqual(1);
    Expect(translatedTable.get(2, 1)).toEqual(2);
    const firstOperation = operations.pop() as MoveRowOperation;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.source).toEqual(0);
    Expect(firstOperation.destination).toEqual(2);
    Expect(() => translatedTable.moveRow(1, 0)).not.toThrow();
    Expect(translatedTable.get(0, 0)).toEqual(5);
    Expect(translatedTable.get(0, 1)).toEqual(6);
    Expect(translatedTable.get(1, 0)).toEqual(3);
    Expect(translatedTable.get(1, 1)).toEqual(4);
    Expect(translatedTable.get(2, 0)).toEqual(1);
    Expect(translatedTable.get(2, 1)).toEqual(2);
    const secondOperation = operations.pop() as MoveRowOperation;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.source).toEqual(1);
    Expect(secondOperation.destination).toEqual(0);
    listener.unlisten();
  }

  /** Tests transactions. */
  @Test()
  public testTransaction(): void {
    const testTable = getTestTable();
    const translatedTable = new TranslatedTableModel(testTable);
    const operations: (Operation | Transaction)[] = [];
    const listener = translatedTable.connect((
      operation: Operation | Transaction) => {operations.push(operation);});
    
    Expect(() => translatedTable.beginTransaction()).not.toThrow();
    Expect(() => translatedTable.moveRow(0, 1)).not.toThrow();
    Expect(() => translatedTable.moveRow(0, 2)).not.toThrow();
    Expect(() => translatedTable.beginTransaction()).not.toThrow();
    Expect(() => translatedTable.moveRow(2, 1)).not.toThrow();
    Expect(() => translatedTable.moveRow(1, 0)).not.toThrow();
    Expect(() => translatedTable.endTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => translatedTable.moveRow(2, 0)).not.toThrow();
    Expect(() => translatedTable.endTransaction()).not.toThrow();
    const firstOperation = operations.pop() as Transaction;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.operations.length).toEqual(5);
    Expect(() => translatedTable.endTransaction()).not.toThrow();
    Expect(() => translatedTable.beginTransaction()).not.toThrow();
    Expect(() => translatedTable.endTransaction()).not.toThrow();
    Expect(operations.length).toEqual(1);
    listener.unlisten();
  }
}
