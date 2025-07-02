import { Injectable } from '@angular/core';

/**
 * Division id extraction サービス
 */
@Injectable({
  providedIn: 'root',
})
export class DivisionIdService {
  /**
   *
   * @param divisions divisionデータ
   * @param divisionConstValue divisionConstの値
   * @returns
   */
  private getDivisions(divisions: any, divisionConstValue: any): any[] {
    const selectDivisions: any[] = divisions[divisionConstValue];
    return selectDivisions;
  }
  /**
   *
   * @param divisions divisionデータ
   * @param pageConstValue divisionConstの値
   * @param statuscode 各区分 divisionデータの code
   * @returns
   */
  public getDivisionid(
    divisions: any,
    pageConstValue: any,
    statuscode: number
  ): number {
    const division = this.getDivisions(divisions, pageConstValue);
    let result!: number;
    for (let i in division) {
      if (division[i].code === statuscode) {
        result = division[i].value;
        break;
      }
    }
    return result;
  }
}
