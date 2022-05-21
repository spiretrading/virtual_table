import {SortOrder} from './sort_order';

/** Header of a column of a table. */
export class HeaderCell {

  /** Constructs a new HeaderCell.
    * @param name - The name to display if there is enough available space.
    * @param shortName - The name to display if there is not enough space.
    * @param sortOrder - The current sorting of the column.
    * @param sortCallback - Callback to sort the column. Returns if the sort was
    *               successful.
    */
  constructor(name: string, shortName: string, sortOrder: SortOrder,
      sortCallback: (newOrder: SortOrder) => boolean) {
    this.#name = name;
    this.#shortName = shortName;
    this.#sortOrder = sortOrder;
    this.#onSort = sortCallback
  }

  /** Get the full name of the header. */
  get name(): string {
    return this.#name;
  }

  /** Get the condensed name of the header. */
  get shortName(): string {
    return this.#shortName;
  }

  /** Get sortable object from the header. */
  get sortOrder(): SortOrder {
    return this.#sortOrder;
  }

  /** Attempts to sort the current column. */
  public sort(): void {
    if(this.#sortOrder === SortOrder.UNSORTABLE) {
      return;
    }
    const nextOrder = (() => {
      switch(this.#sortOrder) {
        case SortOrder.NONE:
          return SortOrder.ASCENDING;
        case SortOrder.ASCENDING:
          return SortOrder.DESCENDING;
        case SortOrder.DESCENDING:
          return SortOrder.ASCENDING;
      }
    })();
    if(this.#onSort(nextOrder)) {
      this.#sortOrder = nextOrder;
    }
  }

  #name: string;
  #shortName: string;
  #sortOrder: SortOrder;
  #onSort: (newOrder: SortOrder) => boolean;
}
