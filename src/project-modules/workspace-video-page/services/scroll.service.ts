import { Injectable } from '@angular/core';

@Injectable()
export class ScrollService {

  
    constructor() {}

    public scrollTo(parentEl:string, element: string | HTMLElement, duration: number = 500, offset: number = 0) {
        if (typeof element === 'string') {
            let el = document.querySelector(element as string);
            let parent = document.querySelector(parentEl as string);

            this.scrollToElement(parent as HTMLElement, el as HTMLElement, duration, offset);
        }else if (element instanceof HTMLElement) {
        	let parent = document.querySelector(parentEl as string);
            this.scrollToElement(parent as HTMLElement, element, duration, offset);
        }else {
            throw new Error('I don\'t find element');
        }
    }

    private scrollToElement(parent:HTMLElement, el: HTMLElement, duration: number, offset: number) {
        if (el) {
            this.doScrolling(parent, el.offsetTop + offset, duration);
        } else {
            throw new Error('I don\'t find element');
        }
    }

    private doScrolling(parent, elementY, duration) {
        const startingY = window.pageYOffset;
        const diff = elementY - startingY;
        let start;

        window.requestAnimationFrame(function step(timestamp) {
            start = (!start) ? timestamp : start;

            const time = timestamp - start;
            let percent = Math.min(time / duration, 1);

            parent.scrollTo(0, startingY + diff * percent);

            if (time < duration) {
                window.requestAnimationFrame(step);
            }
        });
    }

}
