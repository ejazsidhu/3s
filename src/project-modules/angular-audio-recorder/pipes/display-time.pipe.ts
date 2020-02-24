import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'displayTime' })
export class DisplayTime implements PipeTransform {
    transform(value: number): string {

        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value - (hours * 3600)) / 60);
        let seconds: string | number = value - (hours * 3600) - (minutes * 60);
        if (seconds < 10) seconds = `0${seconds}`;

        if (hours > 0) return hours + ':' + minutes + ':' + seconds;
        return minutes + ':' + seconds;
    }
}