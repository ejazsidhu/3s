import { Directive, HostListener, EventEmitter, Output, ElementRef, Renderer2, Input, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { HeaderService } from '@app/services';

type HoleType = 'record' | 'resume';
@Directive({
    selector: '[holdable]',
    host: { '[style.cursor]': '"pointer"' }
})
export class HoldableDirective implements OnDestroy {

    @Input() private type: HoleType;
    @Output() hold: EventEmitter<string> = new EventEmitter();

    // @HostListener('mouseover', ['$event'])
    // @HostListener('mouseout', ['$event'])
    // onMouseOverNOout(event: MouseEvent) {
    //     let showTooltip: boolean = false;
    //     let tooltipText: string;
        
    //     if(event.type === 'mouseover') showTooltip = true;

    //     if(this.type === 'record') tooltipText = this.translations.hold_to_record_audio;
    //     else tooltipText = this.translations.hold_to_resume_audio;

    //     this.showGuideMsg(showTooltip, tooltipText);
    // }

    @HostListener('mouseup', ['$event'])
    @HostListener('mousedown', ['$event'])
    @HostListener('mouseleave', ['$event'])
    onExit(event: MouseEvent) {
        // listen only for left clicks and mouseleave
        if (event.which === 1 || event.which === 0) this.eventChange$.next(event.type);
    }

    private holdStarted = false;
    private eventChange$ = new Subject<string>();
    private tooltipWrapper: ElementRef;
    private isHoldAvailable: boolean = false;

    private translations: any;
    private subscription: Subscription;

    constructor(private headerService: HeaderService, private el: ElementRef, private renderer2: Renderer2) {

        this.subscription = this.headerService.languageTranslation$.subscribe(translations => this.translations = translations);

        this.eventChange$.pipe(debounceTime(200)).subscribe((eventType: string) => {
            if (!this.holdStarted && eventType === 'mousedown') {
                this.expandParentElementSize(this.type);
                this.holdStarted = true;
                this.hold.emit('started');
                // this.showGuideMsg(true, this.translations.audio_is_being_recording);
            } else if (this.holdStarted && (eventType === 'mouseup' || this.holdStarted && eventType === 'mouseleave')) {
                this.collapseParentElementSize(this.type);
                this.holdStarted = false;
                this.hold.emit('stopped');

                let tooltipText: string;
                if(this.type === 'record') tooltipText = this.translations.hold_to_record_audio;
                else tooltipText = this.translations.hold_to_resume_audio;
                // this.showGuideMsg(true, tooltipText);
            }
        });
    }

    protected ngOnChanges() {
        // this.createTooltipWrapper();
    }

    private expandParentElementSize(type: HoleType) {
        if (type === 'record') {
            this.renderer2.setStyle(this.el.nativeElement, 'width', '60px');
            this.renderer2.setStyle(this.el.nativeElement, 'height', '60px');
        } else if (type === 'resume') {
            this.renderer2.setStyle(this.el.nativeElement, 'width', '50px');
            this.renderer2.setStyle(this.el.nativeElement, 'height', '50px');
        }
    }

    private collapseParentElementSize(type: HoleType) {
        if (type === 'record') {
            this.renderer2.setStyle(this.el.nativeElement, 'width', '50px');
            this.renderer2.setStyle(this.el.nativeElement, 'height', '50px');
        } else if (type === 'resume') {
            this.renderer2.setStyle(this.el.nativeElement, 'width', '40px');
            this.renderer2.setStyle(this.el.nativeElement, 'height', '40px');
        }
    }

    // private showGuideMsg(show: boolean, tooltipText?: string) {
    //     if (show) {
    //         if(this.holdStarted) tooltipText = this.translations.audio_is_being_recording;
            
    //         this.renderer2.setProperty(this.tooltipWrapper, 'textContent', tooltipText);
    //         this.renderer2.setStyle(this.tooltipWrapper, 'visibility', 'visible');
    //     } else {
    //         this.renderer2.setStyle(this.tooltipWrapper, 'visibility', 'hidden');
    //     }
    // }

    // private createTooltipWrapper() {
    //     this.tooltipWrapper = this.renderer2.createElement('span');
    //     let tooltipText = this.renderer2.createText('');

    //     if (this.type === 'record') {
    //         this.renderer2.setStyle(this.tooltipWrapper, 'width', '207px');
    //         this.renderer2.setStyle(this.tooltipWrapper, 'top', '-35px');
    //         this.renderer2.setStyle(this.tooltipWrapper, 'right', '0');
    //     } else if (this.type === 'resume') {
    //         this.renderer2.setStyle(this.tooltipWrapper, 'width', '240px');
    //         this.renderer2.setStyle(this.tooltipWrapper, 'top', '-25px');
    //         this.renderer2.setStyle(this.tooltipWrapper, 'right', '-34px');
    //     }

    //     this.renderer2.setStyle(this.tooltipWrapper, 'position', 'absolute');
    //     this.renderer2.setStyle(this.tooltipWrapper, 'visibility', 'hidden');
    //     this.renderer2.setStyle(this.tooltipWrapper, 'min-width', '160px');
    //     this.renderer2.setStyle(this.tooltipWrapper, 'border', '1px solid #CCC');
    //     this.renderer2.setStyle(this.tooltipWrapper, 'borderRadius', '6px');
    //     this.renderer2.setStyle(this.tooltipWrapper, 'color', '#f5f5f5');
    //     this.renderer2.setStyle(this.tooltipWrapper, 'backgroundColor', 'black');
    //     this.renderer2.setStyle(this.tooltipWrapper, 'padding', '5px 7px');

    //     this.renderer2.appendChild(this.tooltipWrapper, tooltipText);
    //     this.renderer2.appendChild(this.el.nativeElement, this.tooltipWrapper);
    // }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}