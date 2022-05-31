import {Expect as CoreExpect, Matcher, MatchError, Test} from 'alsatian';
import {AddRowOperation, ArrayTableModel, MoveRowOperation, Operation,
  RemoveRowOperation, TableModel, Transaction, TranslatedTableModel,
  UpdateOperation} from '../source';

function getTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([1, 2]);
  matrix.push([3, 4]);
  matrix.push([5, 6]);
  return matrix;
}

function getLongTestTable() {
  const matrix = new ArrayTableModel();
  matrix.push([0]);
  matrix.push([1]);
  matrix.push([2]);
  matrix.push([3]);
  matrix.push([4]);
  matrix.push([5]);
  matrix.push([6]);
  matrix.push([7]);
  return matrix;
}

function shuffleRows(table: TranslatedTableModel) {
  table.moveRow(7, 0);
  table.moveRow(6, 1);
  table.moveRow(5, 2);
  table.moveRow(3, 4);
}

class TableMatcher extends Matcher<TableModel | (() => any)> {
  public toEqualCells(expected: any[][]): void {
    if(!(this.actualValue instanceof TableModel)) {
      throw new MatchError('actualValue needs to be a TableModel');
    }
    if(this.actualValue.rowCount !== expected.length) {
      if(this.shouldMatch) {
        throw new MatchError(
          `expected number of rows to be the same`,
          `${expected.length}`,
          `${this.actualValue.rowCount}`
        );
      } else {
        return;
      }
    }
    for(let i = 0; i < this.actualValue.rowCount; ++i) {
      if(this.actualValue.columnCount !== expected[i].length) {
        if(this.shouldMatch) {
          throw new MatchError(
            `expected number of columns to be the same`,
            `${expected[i].length}`,
            `${this.actualValue.columnCount}`
          );
        } else {
          return;
        }
      }
      for(let j = 0; j < this.actualValue.columnCount; ++j) {
        if(this.actualValue.get(i, j) !== expected[i][j]) {
          if(this.shouldMatch) {
            throw new MatchError(
              `expected row ${i} column ${j} values to match`,
              `${expected[i][j]}`,
              `${this.actualValue.get(i, j)}`
            );
          } else {
            return;
          }
        }
      }
    }
    if(!this.shouldMatch) {
      throw new MatchError(
        `expected at least one cell to not match`,
        `${expected}`,
        `${expected}`);
    }
  }

  public toThrow(): void {
    const expect = CoreExpect(this.actualValue as () => any);
    if(!this.shouldMatch) {
      expect.not;
    }
    expect.toThrow();
  }
}

const Expect = (value: any) => new TableMatcher(value);

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

  /** Tests handling AddRowOperations. */
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

  /** Tests handling MoveRowOperations. */
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
    Expect(translation.get(0, 0)).toEqual(1);
    Expect(() => source.move(0, 4)).not.toThrow();
    Expect(source.get(4, 0)).toEqual(10);
    Expect(translation.get(4, 0)).toEqual(4);
    Expect(() => source.move(4, 2)).not.toThrow();
    Expect(source.get(2, 0)).toEqual(10);
    Expect(translation.get(2, 0)).toEqual(10);
    Expect(operations.length).toEqual(0);
    Expect(() => translation.moveRow(2, 0)).not.toThrow();
    Expect(translation.get(0, 0)).toEqual(10);
    Expect(() => source.move(2, 0)).not.toThrow();
    Expect(source.get(0, 0)).toEqual(10);
    Expect(translation.get(1, 0)).toEqual(1);
    Expect(() => source.move(0, 3)).not.toThrow();
    Expect(source.get(3, 0)).toEqual(10);
    Expect(translation.get(3, 0)).toEqual(3);
    Expect(operations.length).toEqual(1);
    listener.unlisten();
  }

  /** Tests handling RemoveRowOperations. */
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

  /** Tests handling UpdateOperations. */
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

  /** Tests handling a variety of operations. */
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
    Expect(translatedTable.get(0, 0)).toEqual(1);
    Expect(translatedTable.get(0, 1)).toEqual(2);
    Expect(translatedTable.get(1, 0)).toEqual(3);
    Expect(translatedTable.get(1, 1)).toEqual(4);
    Expect(translatedTable.get(2, 0)).toEqual(5);
    Expect(translatedTable.get(2, 1)).toEqual(6);
    Expect(translatedTable.get(3, 0)).toEqual(9);
    Expect(translatedTable.get(3, 1)).toEqual(9);
    Expect(() => testTable.insert([7, 7], 2)).not.toThrow();
    Expect(translatedTable.rowCount).toEqual(5);
    Expect(translatedTable.get(4, 0)).toEqual(7);
    Expect(translatedTable.get(4, 1)).toEqual(7);
    const secondOperation = operations.pop() as AddRowOperation;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.index).toEqual(4);
    Expect(() => testTable.move(2, 0)).not.toThrow();
    Expect(translatedTable.get(0, 0)).toEqual(1);
    Expect(translatedTable.get(0, 1)).toEqual(2);
    Expect(translatedTable.get(1, 0)).toEqual(3);
    Expect(translatedTable.get(1, 1)).toEqual(4);
    Expect(translatedTable.get(2, 0)).toEqual(5);
    Expect(translatedTable.get(2, 1)).toEqual(6);
    Expect(translatedTable.get(3, 0)).toEqual(9);
    Expect(translatedTable.get(3, 1)).toEqual(9);
    Expect(translatedTable.get(4, 0)).toEqual(7);
    Expect(translatedTable.get(4, 1)).toEqual(7);
    Expect(() => testTable.remove(4)).not.toThrow();
    Expect(translatedTable.rowCount).toEqual(4);
    Expect(translatedTable.get(0, 0)).toEqual(1);
    Expect(translatedTable.get(0, 1)).toEqual(2);
    Expect(translatedTable.get(1, 0)).toEqual(3);
    Expect(translatedTable.get(1, 1)).toEqual(4);
    Expect(translatedTable.get(2, 0)).toEqual(5);
    Expect(translatedTable.get(2, 1)).toEqual(6);
    Expect(translatedTable.get(3, 0)).toEqual(7);
    Expect(translatedTable.get(3, 1)).toEqual(7);
    const thirdOperation = operations.pop() as RemoveRowOperation;
    Expect(thirdOperation).not.toBeNull();
    Expect(thirdOperation.index).toEqual(3);
    Expect(() => translatedTable.moveRow(0, 2)).not.toThrow();
    Expect(() => testTable.set(0, 1, 10)).not.toThrow();
    Expect(translatedTable.get(2, 0)).toEqual(1);
    Expect(translatedTable.get(2, 1)).toEqual(2);
    const fourthOperation = operations.pop() as UpdateOperation;
    Expect(fourthOperation).not.toBeNull();
    Expect(fourthOperation.row).toEqual(3);
    Expect(fourthOperation.column).toEqual(1);
    listener.unlisten();
  }

  /** Tests how TranslatedTable handles a Transaction. */
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
    Expect(firstOperation.operations.length).toEqual(4);
    Expect(() => testTable.beginTransaction()).not.toThrow();
    Expect(() => testTable.endTransaction()).not.toThrow();
    const secondOperation = operations.pop() as Transaction;
    Expect(secondOperation).not.toBeNull();
    Expect(secondOperation.operations.length).toEqual(0);
    listener.unlisten();
  }

  /** Tests TableExpect which is used by future tests. */
  @Test()
  public testCompareTables(): void {
    const source = getTestTable();
    const expectedTable = [
      [1, 2],
      [3, 4],
      [5, 6]
    ];
    Expect(source).toEqualCells(expectedTable);
    const differentTable = [
      [1, 2],
      [1, -4],
      [0, -6]
    ];
    Expect(source).not.toEqualCells(differentTable);
    const tooShortTable = [
      [1, 2]
    ];
    Expect(source).not.toEqualCells(tooShortTable);
    const tooNarrowTable = [
      [1],
      [3],
      [5]
    ];
    Expect(source).not.toEqualCells(tooNarrowTable);
  }

  /** Tests that shuffleRows produces the expected table. */
  @Test()
  public testShuffle(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    shuffleRows(translatedTable);
    const expectedTable = [
      [7],
      [5],
      [3],
      [1],
      [0],
      [2],
      [4],
      [6]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }

  /** Tests a series of moves. */
  @Test()
  public testsAlternateDirectionShuffle(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    translatedTable.moveRow(7, 0);
    translatedTable.moveRow(7, 1);
    translatedTable.moveRow(7, 2);
    translatedTable.moveRow(1, 7);
    translatedTable.moveRow(5, 2);
    translatedTable.moveRow(3, 4);
    const expectedTable = [
      [7],
      [5],
      [3],
      [1],
      [0],
      [2],
      [4],
      [6]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }

  /** Tests that removing rows is handled correctly after multiple moves. */
  @Test()
  public testRemoveOnShuffled(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    shuffleRows(translatedTable);
    source.remove(2);
    source.remove(3);
    source.remove(0);
    const expectedTable = [
      [7],
      [5],
      [3],
      [1],
      [6]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }

  /** Tests that updating cells is handled correctly after multiple moves. */
  @Test()
  public testUpdateOnShuffled(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    shuffleRows(translatedTable);
    source.set(7, 0, 72);
    source.set(2, 0, -27);
    source.set(0, 0, 100);
    const expectedTable = [
      [72],
      [5],
      [3],
      [1],
      [100],
      [-27],
      [4],
      [6]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }

  /** Tests that adding rows is handled correctly after multiple moves. */
  @Test()
  public testAddToEndOnShuffled(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    shuffleRows(translatedTable);
    source.push([8]);
    source.push([9]);
    source.push([10]);
    const expectedTable = [
      [7],
      [5],
      [3],
      [1],
      [0],
      [2],
      [4],
      [6],
      [8],
      [9],
      [10]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }

  /** Tests that inserts are handled correctly after multiple moves. */
  @Test()
  public testInsertOnShuffled(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    shuffleRows(translatedTable);
    source.insert([8], 1);
    source.insert([9], 5);
    source.insert([10], 5);
    const expectedTable = [
      [7],
      [5],
      [3],
      [1],
      [0],
      [2],
      [4],
      [6],
      [8],
      [9],
      [10]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }

  /** Tests that updates are performed correctly after rows are added. */
  @Test()
  public testInsertThenUpdateOnShuffled(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    shuffleRows(translatedTable);
    source.insert([8], 1);;
    source.push([9]);
    source.set(1, 0, 80);
    source.set(6, 0, 50);
    source.set(0, 0, 100);
    let expectedTable = [
      [7],
      [50],
      [3],
      [1],
      [100],
      [2],
      [4],
      [6],
      [80],
      [9]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }

  /** Tests that remove is performed correctly after a row is inserted. */
  @Test()
  public testInsertThenRemoveOnShuffled(): void {
    const source = getLongTestTable();
    const translatedTable = new TranslatedTableModel(source);
    shuffleRows(translatedTable);
    source.insert([8], 1);;
    source.remove(3);
    let expectedTable = [
      [7],
      [5],
      [3],
      [1],
      [0],
      [4],
      [6],
      [8]
    ];
    Expect(translatedTable).toEqualCells(expectedTable);
  }
}
