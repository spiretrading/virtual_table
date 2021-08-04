import {Expect, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, Transaction, UpdateOperation} from '../source';

/** Tests the ArrayTableModel. */
export class ArrayTableModelTester {

  /** Tests pushing rows. */
  @Test()
  public testPush(): void {
    const model = new ArrayTableModel();
    const operations: Operation[] = [];
    const listener = model.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(model.rowCount).toEqual(0);
    Expect(model.columnCount).toEqual(0);
    Expect(() => model.push([1, 2])).not.toThrow();
    Expect(model.rowCount).toEqual(1);
    Expect(model.get(0, 0)).toEqual(1);
    Expect(model.get(0, 1)).toEqual(2);
    Expect(operations.length == 1);
    const firstOperation = operations.pop() as AddRowOperation;
    Expect(firstOperation !== null);
    Expect(firstOperation.index == 0);
    Expect(() => model.push([1, 2, 3])).toThrow();
    Expect(operations.length == 0);
    Expect(() => model.push([5, 7])).not.toThrow();
    Expect(model.rowCount).toEqual(2);
    Expect(model.get(0, 0)).toEqual(1);
    Expect(model.get(0, 1)).toEqual(2);
    Expect(model.get(1, 0)).toEqual(5);
    Expect(model.get(1, 1)).toEqual(7);
    const secondOperation = operations.pop() as AddRowOperation;
    Expect(firstOperation !== null);
    Expect(secondOperation.index == 1);
    listener.unlisten();
  }

  /** Tests inserting rows. */
  @Test()
  public testInsert(): void {
    const model = new ArrayTableModel();
    const operations: Operation[] = [];
    const listener = model.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => model.push([1, 1])).not.toThrow();
    Expect(() => model.push([2, 2])).not.toThrow();
    Expect(() => model.push([3, 3])).not.toThrow();
    Expect(() => model.push([4, 4])).not.toThrow();
    Expect(() => model.push([5, 5])).not.toThrow();
    Expect(() => model.insert([9, 8, 7], 2)).toThrow();
    Expect(() => model.insert([9, 8], 5)).toThrow();
    Expect(() => model.insert([9, 8], 2)).not.toThrow();
    Expect(model.get(2, 0)).toEqual(9);
    Expect(model.get(2, 1)).toEqual(8);
    Expect(operations.length == 1);
    const firstOperation = operations.pop() as AddRowOperation;
    Expect(firstOperation !== null);
    Expect(firstOperation.index == 2);
    listener.unlisten();
  }

  /** Tests moving rows. */
  @Test()
  public testMove(): void {
    const model = new ArrayTableModel();
    const operations: Operation[] = [];
    const listener = model.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => model.push([1, 1])).not.toThrow();
    Expect(() => model.push([2, 2])).not.toThrow();
    Expect(() => model.push([3, 3])).not.toThrow();
    Expect(() => model.push([4, 4])).not.toThrow();
    Expect(() => model.push([5, 5])).not.toThrow();
    Expect(() => model.move(5, 2)).toThrow();
    Expect(() => model.move(4, 5)).toThrow();
    Expect(() => model.move(2, 4)).not.toThrow();
    Expect(model.get(4, 0)).toEqual(3);
    Expect(model.get(4, 1)).toEqual(3);
    Expect(model.get(2, 0)).toEqual(4);
    Expect(model.get(2, 1)).toEqual(4);
    Expect(() => model.move(3, 0)).not.toThrow();
    Expect(model.get(0, 0)).toEqual(5);
    Expect(model.get(0, 1)).toEqual(5);
    Expect(model.get(3, 0)).toEqual(4);
    Expect(model.get(3, 1)).toEqual(4);
    Expect(() => model.move(0, 0)).not.toThrow();
    Expect(model.rowCount == 5);
    Expect(operations.length == 2);
    const firstOperation = operations[0] as MoveRowOperation;
    Expect(firstOperation !== null);
    Expect(firstOperation.source == 2);
    Expect(firstOperation.destination == 4);
    listener.unlisten();
  }

  /** Tests updating rows. */
  @Test()
  public testRemove(): void {
    const model = new ArrayTableModel();
    const operations: Operation[] = [];
    const listener = model.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => model.push([1, 1])).not.toThrow();
    Expect(() => model.push([2, 2])).not.toThrow();
    Expect(() => model.push([3, 3])).not.toThrow();
    Expect(() => model.push([4, 4])).not.toThrow();
    Expect(() => model.push([5, 5])).not.toThrow();
    Expect(() => model.remove(5)).toThrow();
    Expect(() => model.remove(1)).not.toThrow();
    Expect(() => model.remove(3)).not.toThrow();
    Expect(model.rowCount).toEqual(3);
    const secondOperation = operations.pop() as RemoveRowOperation;
    Expect(operations.length == 1);
    Expect(secondOperation !== null);
    Expect(secondOperation.index == 3);
    listener.unlisten();
  }

  /** Tests setting values. */
  @Test()
  public testSet(): void {
    const model = new ArrayTableModel();
    const operations: Operation[] = [];
    const listener = model.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => model.push([1, 1])).not.toThrow();
    Expect(() => model.push([2, 2])).not.toThrow();
    Expect(() => model.push([3, 3])).not.toThrow();
    Expect(() => model.push([4, 4])).not.toThrow();
    Expect(() => model.push([5, 5])).not.toThrow();
    Expect(() => model.set(5, 3, 9)).toThrow();
    Expect(() => model.set(3, 3, 9)).toThrow();
    Expect(() => model.set(0, 0, 9)).not.toThrow();
    Expect(model.get(0, 0)).toEqual(9);
    Expect(() => model.set(2, 0, 0)).not.toThrow();
    Expect(() => model.set(4, 1, 99)).not.toThrow();
    Expect(operations.length == 3);
    const firstOperation = operations[0] as UpdateOperation;
    Expect(firstOperation !== null);
    Expect(firstOperation.row == 0);
    Expect(firstOperation.column == 0);
    listener.unlisten();
  }

  /** Tests transactions. */
  @Test()
  public testTransaction(): void {
    const model = new ArrayTableModel();
    const operations: (Operation | Transaction)[] = [];
    const listener = model.connect((operation: Operation | Transaction) => {
      operations.push(operation);
    });
    Expect(() => model.push([1, 1])).not.toThrow();
    Expect(() => model.push([2, 2])).not.toThrow();
    Expect(operations.length == 2);
    Expect(() => model.beginTransaction()).not.toThrow();
    Expect(() => model.push([3, 3])).not.toThrow();
    Expect(() => model.insert([9, 8], 2)).not.toThrow();
    Expect(() => model.move(0, 2)).not.toThrow();
    Expect(() => model.remove(1)).not.toThrow();
    Expect(() => model.set(2, 0, 0)).not.toThrow();
    Expect(operations.length == 2);
    Expect(() => model.endTransaction()).not.toThrow();
    const thirdOperation = operations.pop() as Transaction;
    Expect(thirdOperation !== null);
    Expect(thirdOperation.operations.length).toEqual(5);
    listener.unlisten();
  }
}
