import { Expect, Test } from 'alsatian';
import { AddRowOperation, ArrayTableModel, Operation } from '../source';

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
}
