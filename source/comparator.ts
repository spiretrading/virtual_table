/** Class used to polymorphically compare two values in a TableModel. */
export class Comparator {

  /** Compares the order of two values.
   * @param left - The left side of the comparison.
   * @param right - The right side of the comparison.
   * @return A negative number iff left comes before right.
   *         A positive number iff left comes after right.
   *         0 iff left is equal to right.
   * @throws {TypeError} - The parameters can not be compared to one another.
   */
  public compareValues(left: any, right: any): number {
    if(left === right) {
      return 0;
    } else if(left === undefined) {
      return -1;
    } else if(right === undefined) {
      return 1;
    } else if(left === null) {
      return -1;
    } else if(right === null) {
      return 1;
    } else if(typeof left !== typeof right) {
      throw TypeError('The parameters can not be compared to one another');
    } else if(typeof left === 'object') {
      if(!(left instanceof Date) || !(right instanceof Date)) {
        throw TypeError('The parameters can not be compared to one another');
      }
    }
    switch(typeof left) {
      case 'boolean':
        if(left) {
          return 1;
        } else {
          return -1;
        }
      case 'number':
        if(isFinite(left) && isFinite(right)) {
          return left - right;
        } else if(right === -Infinity) {
          return 1;
        } else if(left === -Infinity) {
          return -1;
        } else if(left === Infinity) {
          return 1;
        } else if(right === Infinity) {
          return -1;
        } else if(isNaN(right)) {
          return 1;
        } else if(isNaN(left)) {
          return -1;
        }
        throw TypeError('The numbers can not be compared to one another');
      case 'object':
        if(left.valueOf() > right.valueOf()) {
          return 1;
        } else {
          return -1;
        }
      case 'string':
        return left.localeCompare(right);
      case 'symbol':
        return left.toString().localeCompare(right.toString());
    }
  }
}
