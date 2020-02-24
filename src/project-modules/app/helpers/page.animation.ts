import { trigger, state, style, transition, animate } from '@angular/animations';


/** 
 * A little animation slide up for better user experience
 * How To User
 * Step 1 : import { PageAnimation } from 'modules/shared/helper';
 * Step 2 : animations: [PageAnimation] // Add in @Component 
 * Step 3 : public pageState = 'active';// add in your component.ts class
 * Step 4 : <div [@pageState]="pageState"> // Add this in html on div which you want to slide up
*/
export const PageAnimation = trigger('pageState', [
    state('*', style({
        // transform: 'translateY(2%)',
        transform: 'scale(0.99)',
        opacity: '0',
    })),
    state('active', style({
        // transform: 'translateY(0)',
        transform: 'scale(1)',
        opacity: '1'
    })),
    transition('* => active', animate('300ms ease-in')),
    transition('active => *', animate('250ms ease-in'))
]);


export const SlideIn = trigger('pageState', [
    state('*', style({
        transform: 'translateX(100%)',
    })),
    state('in', style({
        transform: 'translateX(0)',
    })),
    state('out', style({
        transform: 'translateX(-100%)',
    })),
    transition('* => in', animate('600ms ease-in')),
    transition('in => out', animate('600ms ease-in'))
]);