/** Unifies all operations that can be performed on a TableModel. */
export type Operation =
  AddRowOperation | MoveRowOperation | RemoveRowOperation | UpdateOperation |
  Transaction;

/** Indicates a row was added to the model. */
export class AddRowOperation {

  /**
   * Constructs an AddRowOperation.
   * @param index - The index the row was added to.
   */
  constructor(index: number) {
    this._index = index;
  }

  /** Returns the index of the added row. */
  public get index(): number {
    return this._index;
  }

  private _index: number;
}

/** Indicates a row was moved. */
export class MoveRowOperation {

  /**
   * Constructs a MoveRowOperation.
   * @param source - The index that the row was moved from.
   * @param destination - The index that the row was moved to.
   */
  constructor(source: number, destination: number) {
    this._source = source;
    this._destination = destination;
  }

  /** Returns the index that the row was moved from. */
  public get source(): number {
    return this._source;
  }

  /** Returns the index that the row was moved to. */
  public get destination(): number {
    return this._destination;
  }

  private _source: number;
  private _destination: number;
}

/** Indicates a row was removed. */
export class RemoveRowOperation {

  /**
   * Constructs a RemoveRowOperation.
   * @param index - The index of the row that was removed.
   */
  constructor(index: number) {
    this._index = index;
  }

  /** Returns the index where the row was removed from. */
  public get index(): number {
    return this._index;
  }

  private _index: number;
}

/** Indicates a value was updated. */
export class UpdateOperation {

  /**
   * Constructs an operation to update a value.
   * @param row - The index of the row that was updated.
   * @param column - The index of the column that was updated.
   */
  constructor(row: number, column: number) {
    this._row = row;
    this._column = column;
  }

  /** Returns the index of the updated row. */
  public get row(): number {
    return this._row;
  }

  /** Returns the index of the updated column. */
  public get column(): number {
    return this._column;
  }

  private _row: number;
  private _column: number;
}

/** Indicates multiple operations were executed transactionally. */
export class Transaction {

  /**
   * Constructs a Transaction.
   * @param operations The list of operations executed.
   */
  constructor(operations: Operation[]) {
    this._operations = operations;
  }

  /** Returns the list of operations executed. */
  public get operations(): Operation[] {
    return this._operations;
  }

  private _operations: Operation[];
}
