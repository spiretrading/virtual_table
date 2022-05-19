import {Sorting} from './sorting';

/** Column header data. */
export interface HeaderCell {

  /** The name to show in the header.*/
  get name(): string;

  /**  The condensed version of the name. */
  get shortName(): string;

  /** Ordering */
  get order(): Order;
}

export type Order = Sortable | Unsortable;

/** The interface for a sortable header */
export interface Sortable {

  /** Returns the current sort order. */
  get sortOrder(): Sorting;

  /** Updates the sort order. */
  updateSorting(sortOrder: Sorting): void;
}

/** The interface for a header that cannot be sorted*/
export interface Unsortable {

  /** Returns the current sort order. */
  get sortOrder(): Sorting;
}
