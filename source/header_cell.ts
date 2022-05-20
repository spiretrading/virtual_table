import {Sorting} from './sorting';
import {Filter} from './filter';

export class HeaderCell {
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

  get name(): string {
    return this.#name;
  }

  get shortName(): string {
    return this.#shortName;
  }

  get sortable(): HeaderCell.Sortable | HeaderCell.Unsortable {
    return this.#sorting;
  }

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
    constructor(sorting: Sorting) {
      this.#sorting = sorting;
    }

    get sortOrder(): Sorting {
      return this.#sorting;
    }

    updateSorting(sortOrder: Sorting): void {
      this.#sorting = sortOrder;
    }

    #sorting: Sorting;
  }

  export class Unsortable {
    get sortOrder(): Sorting {
      return Sorting.NONE
    }
  }

  export class Unfilterable {
    get filter(): Filter {
      return Filter.NONE;
    }
  }
}
