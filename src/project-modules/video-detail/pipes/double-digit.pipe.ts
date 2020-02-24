import { Pipe, PipeTransform } from '@angular/core';

/**
 * Show double digit number
 * Description: If you want to show the digits from 0-9 as 00-09, then use this pipe
 */
@Pipe({ name: 'DoubleDigit' })
export class DoubleDigitPipe implements PipeTransform {
  transform(value: number): number | string {
    if (value < 10) return `0${Number(value)}`;
    else return value;
  }
}
