import {Expect, Test} from 'alsatian';
import {AddRowOperation, MoveRowOperation, Operation, RemoveRowOperation,
  Transaction, TransactionLog, UpdateOperation} from '../source';

/** Tests the TransactionLog. */
export class ArrayTableModelTester {

  /** Tests operations with no transaction in progress. */
  @Test()
  public testOperations(): void {
    const transactionLog = new TransactionLog();
    const operations: Operation[] = [];
    const listener = transactionLog.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => transactionLog.push(new AddRowOperation(7))).not.toThrow();
    const addOperation = operations.pop() as AddRowOperation;
    Expect(addOperation).not.toBeNull();
    Expect(addOperation.index).toEqual(7);
    Expect(() => transactionLog.push(new MoveRowOperation(2, 8))).
      not.toThrow();
    const moveOperation = operations.pop() as MoveRowOperation;
    Expect(moveOperation).not.toBeNull();
    Expect(moveOperation.source).toEqual(2);
    Expect(moveOperation.destination).toEqual(8);
    Expect(() => transactionLog.push(new RemoveRowOperation(5))).not.toThrow();
    const removeOperation = operations.pop() as RemoveRowOperation;
    Expect(removeOperation).not.toBeNull();
    Expect(removeOperation.index).toEqual(5);
    Expect(() => transactionLog.push(new UpdateOperation(1, 9))).not.toThrow();
    const updateOperation = operations.pop() as UpdateOperation;
    Expect(updateOperation).not.toBeNull();
    Expect(updateOperation.row).toEqual(1);
    Expect(updateOperation.column).toEqual(9);
    listener.unlisten();
  }

  /** Tests operations with transaction in progress. */
  @Test()
  public testTransaction(): void {
    const transactionLog = new TransactionLog();
    const operations: Operation[] = [];
    const listener = transactionLog.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.beginTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.push(new AddRowOperation(25))).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.beginTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.push(new MoveRowOperation(0, 10))).
      not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.push(new RemoveRowOperation(7))).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.push(new UpdateOperation(6, 2))).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    const transaction = operations.pop() as Transaction;
    Expect(transaction).not.toBeNull();
    Expect(transaction.operations.length).toEqual(4);
    const addOperation = transaction.operations[0] as AddRowOperation;
    Expect(addOperation).not.toBeNull();
    Expect(addOperation.index).toEqual(25);
    const moveOperation = transaction.operations[1] as MoveRowOperation;
    Expect(moveOperation).not.toBeNull();
    Expect(moveOperation.source).toEqual(0);
    Expect(moveOperation.destination).toEqual(10);
    const removeOperation = transaction.operations[2] as RemoveRowOperation;
    Expect(removeOperation).not.toBeNull();
    Expect(removeOperation.index).toEqual(7);
    const updateOperation = transaction.operations[3] as UpdateOperation;
    Expect(updateOperation).not.toBeNull();
    Expect(updateOperation.row).toEqual(6);
    Expect(updateOperation.column).toEqual(2);
    listener.unlisten();
  }

  /** Tests empty transactions. */
  @Test()
  public testEmptyTransactions(): void {
    const transactionLog = new TransactionLog();
    const operations: Operation[] = [];
    const listener = transactionLog.connect((operation: Operation) => {
      operations.push(operation);
    });
    Expect(() => transactionLog.beginTransaction()).not.toThrow();
    Expect(() => transactionLog.beginTransaction()).not.toThrow();
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    const firstEmptyTransaction = operations.pop() as Transaction;
    Expect(firstEmptyTransaction).not.toBeNull();
    Expect(firstEmptyTransaction.operations.length).toEqual(0);
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    Expect(operations.length).toEqual(0);
    Expect(() => transactionLog.beginTransaction()).not.toThrow();
    Expect(() => transactionLog.endTransaction()).not.toThrow();
    const secondEmptyTransaction = operations.pop() as Transaction;
    Expect(secondEmptyTransaction).not.toBeNull();
    Expect(secondEmptyTransaction.operations.length).toEqual(0);
    listener.unlisten();
  }
}
