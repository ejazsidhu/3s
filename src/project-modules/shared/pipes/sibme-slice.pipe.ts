import { Pipe, PipeTransform } from '@angular/core';

/**
 * Import Shared module into the module in which you want to use sibmeSlice pipe
 * Use as {{str | sibmeSlice}} or {{str | sibmeSlice:30}} with or without sliceBy length as it has default sliceBy length of 20
 */
@Pipe({
    name: 'sibmeSlice'
})
export class SibmeSlicePipe implements PipeTransform {
    transform(str: string = '', sliceBy: number = 20): any {
        return (str.length < sliceBy) ? str : str.slice(0, sliceBy) + '...';
    }

}
