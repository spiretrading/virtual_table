/** Unifies all operations that can be performed on a TableModel. */
export type Operation =
  AddRowOperation | MoveRowOperation | RemoveRowOperation | UpdateOperation;

/** Indicates a row was added to the model. */
export class AddRowOperation {

  /**
   * Constructs an AddRowOperation.
   * @param index - The index the row was added to.
   */
  constructor(index: number) {}

  /** Returns the index of the added row. */
  public get index(): number {
    return 0;
  }
}

/** Indicates a row was moved. */
export class MoveRowOperation {

  /**
   * Constructs a MoveRowOperation.
   * @param source - The index that the row was moved from.
   * @param destination - The index that the row was moved to.
   */
  constructor(source: number, destination: number) {}

  /** Returns the index that the row was moved from. */
  public get source(): number {
    return 0;
  }

  /** Returns the index that the row was moved to. */
  public get destination(): number {
    return 0;
  }
}

/** Indicates a row was removed. */
export class RemoveRowOperation {

  /**
   * Constructs a RemoveRowOperation.
   * @param index - The index of the row that was removed.
   */
  constructor(index: number) {}

  /** Returns the index where the row was removed from. */
  public get index(): number {
    return 0;
  }
}

/** Indicates a value was updated. */
export class UpdateOperation {

  /**
   * Constructs an operation to update a value.
   * @param row - The index of the row that was updated.
   * @param column - The index of the column that was updated.
   */
  constructor(row: number, column: number) {}

  /** Returns the index of the updated row. */
  public get row(): number {
    return 0;
  }

  /** Returns the index of the updated column. */
  public get column(): number {
    return 0;
  }
}

/** Indicates multiple operations were executed transactionally. */
export class Transaction {

  /**
   * Constructs a Transaction.
   * @param operations The list of operations executed.
   */
  constructor(operations: Operation[]) {}

  /** Returns the list of operations executed. */
  public get operations(): Operation[] {
    return [];
  }
}
