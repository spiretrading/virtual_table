import {Sorting} from './sorting';

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

  #name: string;
  #shortName: string;
  #sorting: HeaderCell.Sortable | HeaderCell.Unsortable;
}

export namespace HeaderCell {
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
    constructor() {
      this.#sorting = Sorting.NONE;
    }

    get sortOrder(): Sorting {
      return this.#sorting;
    }

    #sorting: Sorting;
  }
}