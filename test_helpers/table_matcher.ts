import {Expect as CoreExpect, Matcher, MatchError} from 'alsatian';
import {TableModel} from '../source';

class TableMatcher<T> extends Matcher<T | (() => any)> {
  public toEqual(expected: any): void {
    if(!(this.actualValue instanceof TableModel)) {
      return super.toEqual(expected);
    }
    if(!Array.isArray(expected) && !(expected instanceof TableModel)) {
      throw new MatchError(`expectValue needs to be a TableModel or an array`);
    }
    const expectedRowCount = this.expectedRowCount(expected);
    if(this.actualValue.rowCount !== expectedRowCount) {
      if(this.shouldMatch) {
        throw new MatchError(
          `expected number of rows to be the same`,
          `${expectedRowCount}`,
          `${this.actualValue.rowCount}`
        );
      } else {
        return;
      }
    }
    for(let i = 0; i < this.actualValue.rowCount; ++i) {
      const expectedColumnCount = this.expectedColumnCount(expected, i);
      if(this.actualValue.columnCount !== expectedColumnCount) {
        if(this.shouldMatch) {
          throw new MatchError(
            `expected number of columns to be the same`,
            `${expectedColumnCount}`,
            `${this.actualValue.columnCount}`
          );
        } else {
          return;
        }
      }
      for(let j = 0; j < this.actualValue.columnCount; ++j) {
        const expectedValue = this.getExpectedCellValue(expected, i, j);
        if(this.actualValue.get(i, j) !== expectedValue) {
          if(this.shouldMatch) {
            throw new MatchError(
              `expected row ${i} column ${j} values to match`,
              `${expectedValue}`,
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
        `expected at least one cell to not match`);
    }
  }

  private expectedRowCount(expected: TableModel | any[][]) {
    if(expected instanceof TableModel) {
      return expected.rowCount;
    } else {
      return expected.length;
    }
  }

  private expectedColumnCount(expected: TableModel | any[][], row: number) {
    if(expected instanceof TableModel) {
      return expected.columnCount;
    } else {
      return expected[row].length;
    }
  }

  private getExpectedCellValue(expected: TableModel | any[][], row: number,
      column: number) {
    if(expected instanceof TableModel) {
      return expected.get(row, column);
    } else {
      return expected[row][column];
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

export const Expect = (value: any) => new TableMatcher(value);
