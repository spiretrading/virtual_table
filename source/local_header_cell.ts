import {HeaderCell, Order, Sortable, Unsortable} from './header_cell';
import {Sorting} from './sorting';

export class LocalHeaderCell implements HeaderCell {
  constructor(name: string, shortName: string, sorting: Sorting,
      isSortable: boolean) {
    this.#name = name;
    this.#shortName = shortName;
    if(isSortable) {
      this.#sorting = new PrivateSortable(sorting);
    } else {
      this.#sorting = new PrivateUnsortable(sorting);
    }
  }

  get name(): string {
    return this.#name;
  }

  get shortName(): string {
    return this.#shortName;
  }

  get order(): Order {
    return this.#sorting;
  }

  #name: string;
  #shortName: string;
  #sorting: Order;
}

class PrivateSortable implements Sortable {
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

class PrivateUnsortable implements Unsortable {
  constructor(sorting: Sorting) {
    this.#sorting = sorting;
  }

  get sortOrder(): Sorting {
    return this.#sorting;
  }

  #sorting: Sorting;
}
