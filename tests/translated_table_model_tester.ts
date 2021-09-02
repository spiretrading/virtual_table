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
    Expect(() => translatedTable.get(10, 1)).toThrow();
    Expect(() => translatedTable.get(-10, 1)).toThrow();
    Expect(() => translatedTable.get(1, 10)).toThrow();
    Expect(() => translatedTable.get(1, -10)).toThrow();
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

  /** Tests link to add operations from source. */
  @Test()
  public testSourceAdd(): void {
    const source = new ArrayTableModel();
    Expect(() => source.push([1])).not.toThrow();
    Expect(() => source.push([2])).not.toThrow();
    Expect(() => source.push([3])).not.toThrow();
    Expect(() => source.push([4])).not.toThrow();
    const translation = new TranslatedTableModel(source);
    Expect(() => translation.moveRow(3, 0)).not.toThrow();
    Expect(() => translation.moveRow(3, 1)).not.toThrow();
    Expect(() => translation.moveRow(3, 2)).not.toThrow();
    Expect(() => source.push([5])).not.toThrow();
    Expect(translation.get(0, 0)).toEqual(4);
    Expect(translation.get(1, 0)).toEqual(3);
    Expect(translation.get(2, 0)).toEqual(2);
    Expect(translation.get(3, 0)).toEqual(1);
    Expect(translation.get(4, 0)).toEqual(5);
    Expect(() => source.insert([10], 0)).not.toThrow();
    Expect(translation.get(5, 0)).toEqual(10);
    Expect(() => source.insert([20], 3)).not.toThrow();
    Expect(translation.get(6, 0)).toEqual(20);
    Expect(() => source.insert([40], 7)).not.toThrow();
    Expect(translation.get(7, 0)).toEqual(40);
    Expect(() => source.insert([40], 10)).toThrow();
  }

  /** Tests link to move operations from source. */
  @Test()
  public testSourceMove(): void {
    const source = new ArrayTableModel();
    Expect(() => source.push([1])).not.toThrow();
    Expect(() => source.push([2])).not.toThrow();
    Expect(() => source.push([10])).not.toThrow();
    Expect(() => source.push([3])).not.toThrow();
    Expect(() => source.push([4])).not.toThrow();
    const translation = new TranslatedTableModel(source);
    const operations: (Operation | Transaction)[] = [];
    const listener = translation.connect((
      operation: Operation | Transaction) => {operations.push(operation);});
    Expect(() => source.move(2, 0)).not.toThrow();
    Expect(source.get(0, 0)).toEqual(10);
    Expect(translation.get(0, 0)).toEqual(10);
    Expect(() => source.move(0, 4)).not.toThrow();
    Expect(source.get(4, 0)).toEqual(10);
    Expect(translation.get(4, 0)).toEqual(10);
    Expect(() => source.move(4, 2)).not.toThrow();
    Expect(source.get(2, 0)).toEqual(10);
    Expect(translation.get(2, 0)).toEqual(10);
    Expect(() => translation.moveRow(2, 0)).not.toThrow();
    Expect(translation.get(0, 0)).toEqual(10);
    Expect(() => source.move(2, 0)).not.toThrow();
    Expect(source.get(0, 0)).toEqual(10);
    Expect(translation.get(1, 0)).toEqual(10);
    Expect(() => source.move(0, 3)).not.toThrow();
    Expect(source.get(3, 0)).toEqual(10);
    Expect(translation.get(3, 0)).toEqual(10);
    listener.unlisten();
  }

  /** Tests link to remove operations from source. */
  @Test()
  public testSourceRemove(): void {
    const source = new ArrayTableModel();
    Expect(() => source.push([10])).not.toThrow();
    Expect(() => source.push([1])).not.toThrow();
    Expect(() => source.push([2])).not.toThrow();
    Expect(() => source.push([3])).not.toThrow();
    Expect(() => source.push([4])).not.toThrow();
    const translation = new TranslatedTableModel(source);
    const operations: Operation[] = [];
    const listener = translation.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => translation.moveRow(0, 4)).not.toThrow();
    Expect(() => source.remove(0)).not.toThrow();
    Expect(translation.get(3, 0)).toEqual(4);
    const firstOperation = operations.pop() as RemoveRowOperation;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.index).toEqual(4);
    Expect(() => source.push([10])).not.toThrow();
    Expect(() => translation.moveRow(4, 0)).not.toThrow();
    Expect(() => source.remove(4)).not.toThrow();
    Expect(translation.get(0, 0)).toEqual(1);
    const secondOperation = operations.pop() as RemoveRowOperation;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.index).toEqual(0);
    listener.unlisten();
  }

  /** Tests link to update operations from source. */
  @Test()
  public testSourceUpdate(): void {
    const source = new ArrayTableModel();
    Expect(() => source.push([0])).not.toThrow();
    Expect(() => source.push([1])).not.toThrow();
    Expect(() => source.push([2])).not.toThrow();
    Expect(() => source.push([3])).not.toThrow();
    Expect(() => source.push([4])).not.toThrow();
    const translation = new TranslatedTableModel(source);
    const operations: Operation[] = [];
    const listener = translation.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => translation.moveRow(0, 4)).not.toThrow();
    Expect(() => source.set(0, 0, 10)).not.toThrow();
    Expect(translation.get(4, 0)).toEqual(10);
    const firstOperation = operations.pop() as UpdateOperation;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.row).toEqual(4);
    Expect(() => translation.moveRow(3, 0)).not.toThrow();
    Expect(() => source.set(4, 0, 10)).not.toThrow();
    Expect(translation.get(4, 0)).toEqual(10);
    const secondOperation = operations.pop() as UpdateOperation;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.row).toEqual(0);
    listener.unlisten();
  }

  /** Tests link to combinations of source operations. */
  @Test()
  public testSourceTableUpdates(): void {
    const testTable = getTestTable();
    const translatedTable = new TranslatedTableModel(testTable);
    const operations: Operation[] = [];
    const listener = translatedTable.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => testTable.insert([9, 9], 1)).not.toThrow();
    Expect(translatedTable.rowCount).toEqual(4);
    Expect(translatedTable.get(3, 0)).toEqual(9);
    Expect(translatedTable.get(3, 1)).toEqual(9);
    const firstOperation = operations.pop() as AddRowOperation;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.index).toEqual(3);
    Expect(() => testTable.move(1, 3)).not.toThrow();
    Expect(translatedTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedTable.get(0, 1)).toEqual(testTable.get(0, 1));
    Expect(translatedTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedTable.get(1, 1)).toEqual(testTable.get(1, 1));
    Expect(translatedTable.get(2, 0)).toEqual(testTable.get(3, 0));
    Expect(translatedTable.get(2, 1)).toEqual(testTable.get(3, 1));
    Expect(translatedTable.get(3, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedTable.get(3, 1)).toEqual(testTable.get(2, 1));
    const secondOperation = operations.pop() as MoveRowOperation;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.source).toEqual(3);
    Expect(secondOperation.destination).toEqual(2);
    Expect(() => testTable.insert([7, 7], 2)).not.toThrow();
    Expect(translatedTable.rowCount).toEqual(5);
    Expect(translatedTable.get(4, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedTable.get(4, 1)).toEqual(testTable.get(2, 1));
    const thirdOperation = operations.pop() as AddRowOperation;
    Expect(thirdOperation).not.toBeNull();
    Expect(thirdOperation.index).toEqual(4);
    Expect(() => testTable.move(2, 0)).not.toThrow();
    Expect(translatedTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedTable.get(0, 1)).toEqual(testTable.get(0, 1));
    Expect(translatedTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedTable.get(1, 1)).toEqual(testTable.get(1, 1));
    Expect(translatedTable.get(2, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedTable.get(2, 1)).toEqual(testTable.get(2, 1));
    Expect(translatedTable.get(3, 0)).toEqual(testTable.get(4, 0));
    Expect(translatedTable.get(3, 1)).toEqual(testTable.get(4, 1));
    Expect(translatedTable.get(4, 0)).toEqual(testTable.get(3, 0));
    Expect(translatedTable.get(4, 1)).toEqual(testTable.get(3, 1));
    const fourthOperation = operations.pop() as MoveRowOperation;
    Expect(fourthOperation).not.toBeNull();
    Expect(fourthOperation.source).toEqual(4);
    Expect(fourthOperation.destination).toEqual(0);
    Expect(() => testTable.remove(4)).not.toThrow();
    Expect(translatedTable.rowCount).toEqual(4);
    Expect(translatedTable.get(0, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedTable.get(0, 1)).toEqual(testTable.get(0, 1));
    Expect(translatedTable.get(1, 0)).toEqual(testTable.get(1, 0));
    Expect(translatedTable.get(1, 1)).toEqual(testTable.get(1, 1));
    Expect(translatedTable.get(2, 0)).toEqual(testTable.get(2, 0));
    Expect(translatedTable.get(2, 1)).toEqual(testTable.get(2, 1));
    Expect(translatedTable.get(3, 0)).toEqual(testTable.get(3, 0));
    Expect(translatedTable.get(3, 1)).toEqual(testTable.get(3, 1));
    const fifthOperation = operations.pop() as RemoveRowOperation;
    Expect(fifthOperation).not.toBeNull();
    Expect(fifthOperation.index).toEqual(3);
    Expect(() => translatedTable.moveRow(0, 2)).not.toThrow();
    Expect(() => testTable.set(0, 1, 10)).not.toThrow();
    Expect(translatedTable.get(2, 0)).toEqual(testTable.get(0, 0));
    Expect(translatedTable.get(2, 1)).toEqual(testTable.get(0, 1));
    const seventhOperation = operations.pop() as UpdateOperation;
    Expect(seventhOperation).not.toBeNull();
    Expect(seventhOperation.row).toEqual(2);
    Expect(seventhOperation.column).toEqual(1);
    listener.unlisten();
  }

  /** Tests link to source transaction. */
  @Test()
  public testSourceTableTransactions(): void {
    const testTable = getTestTable();
    const translatedTable = new TranslatedTableModel(testTable);
    const operations: Operation[] = [];
    const listener = translatedTable.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => testTable.beginTransaction()).not.toThrow();
    Expect(() => testTable.insert([9, 9], 1)).not.toThrow();
    Expect(() => testTable.move(1, 3)).not.toThrow();
    Expect(() => testTable.insert([7, 7], 2)).not.toThrow();
    Expect(() => testTable.move(2, 0)).not.toThrow();
    Expect(() => testTable.remove(4)).not.toThrow();
    Expect(() => testTable.set(0, 1, 10)).not.toThrow();
    Expect(() => testTable.endTransaction()).not.toThrow();
    const firstOperation = operations.pop() as Transaction;
    Expect(firstOperation).not.toBeNull();
    Expect(firstOperation.operations.length).toEqual(6);
    Expect(() => testTable.beginTransaction()).not.toThrow();
    Expect(() => testTable.endTransaction()).not.toThrow();
    const secondOperation = operations.pop() as Transaction;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.operations.length).toEqual(0);
    listener.unlisten();
  }
}
