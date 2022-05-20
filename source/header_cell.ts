import {Sorting} from './sorting';
import {Filter} from './filter';

/** Header of a column of a table. */
export class HeaderCell {

  /** Constructs a new HeaderCell.
    * @param name - The name to display if there is enough available space.
    * @param shortName - The name to display if there is not enough space.
    * @param isSortable - Indicates if the column is sortable.
    * @param sorting - The current sorting of the column.
    */
  constructor(name: string, shortName: string, isSortable: boolean = true,
      sorting: Sorting = Sorting.NONE) {
    this.#name = name;
    this.#shortName = shortName;
    if(isSortable) {
      this.#sorting = new HeaderCell.Sortable(sorting);
    } else {
      this.#sorting = new HeaderCell.Unsortable();
    }
    this.#filterable = new HeaderCell.Unfilterable();
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
  get sortOrder(): Sorting {
    return this.#sorting.sortOrder;
  }

  /** Get sortable object from the header. */
  get sortable(): HeaderCell.Sortable | HeaderCell.Unsortable {
    return this.#sorting;
  }

  /** Get sortable object from the header. */
  get filter(): Filter {
    return this.#filterable.filter;
  }

  /** Get filterable object from the header. */
  get filterable(): HeaderCell.Unfilterable {
    return this.#filterable;
  }

  #name: string;
  #shortName: string;
  #sorting: HeaderCell.Sortable | HeaderCell.Unsortable;
  #filterable: HeaderCell.Unfilterable;
}

export namespace HeaderCell {

  /** Sortable header. */
  export class Sortable {

    /** Constructs a new Sortable.
     * @param sorting - The initial sorting of the column.
     */
    constructor(sorting: Sorting) {
      this.#sorting = sorting;
    }

    /** Current sort order of the header. */
    get sortOrder(): Sorting {
      return this.#sorting;
    }

    /** Updates the sorting of the column.
     * @param sortOrder - The new sorting. 
     */
    updateSorting(sortOrder: Sorting): void {
      this.#sorting = sortOrder;
    }

    #sorting: Sorting;
  }

  /** A header that can not be sorted. */
  export class Unsortable {

    /** Current sort order of the header. */
    get sortOrder(): Sorting {
      return Sorting.NONE
    }
  }

  /** A header that can not be filtered. */
  export class Unfilterable {
    
    /** Get the filter of the header. */
    get filter(): Filter {
      return Filter.NONE;
    }
  }
}
