import {Expect as CoreExpect, Matcher, MatchError} from 'alsatian';
import {TableModel} from '../source';

class TableMatcher extends Matcher<TableModel | (() => any)> {
  public toEqualCells(expected: any[][]): void {
    if(!(this.actualValue instanceof TableModel)) {
      throw new MatchError('actualValue needs to be a TableModel');
    }
    if(this.actualValue.rowCount !== expected.length) {
      if(this.shouldMatch) {
        throw new MatchError(
          `expected number of rows to be the same`,
          `${expected.length}`,
          `${this.actualValue.rowCount}`
        );
      } else {
        return;
      }
    }
    for(let i = 0; i < this.actualValue.rowCount; ++i) {
      if(this.actualValue.columnCount !== expected[i].length) {
        if(this.shouldMatch) {
          throw new MatchError(
            `expected number of columns to be the same`,
            `${expected[i].length}`,
            `${this.actualValue.columnCount}`
          );
        } else {
          return;
        }
      }
      for(let j = 0; j < this.actualValue.columnCount; ++j) {
        if(this.actualValue.get(i, j) !== expected[i][j]) {
          if(this.shouldMatch) {
            throw new MatchError(
              `expected row ${i} column ${j} values to match`,
              `${expected[i][j]}`,
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
        `expected at least one cell to not match`,
        `${expected}`,
        `${expected}`);
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
