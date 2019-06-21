import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonItemSliding } from '@ionic/angular';

@Component({
  selector: 'app-scroll-table',
  templateUrl: './scroll-table.component.html',
  styleUrls: ['./scroll-table.component.scss'],
})
export class ScrollTableComponent implements OnInit {

  @Input() keyName: any;
  @Input() valueName: any;
  @Input() dataArray: any[];
  @Input() formatFn?: (data) => string;
  @Input() keyFormatFn?: (data) => string;
  @Input() columnSize?: {key: number; value: number, option?: number};
  @Input() showHeader: boolean;
  @Input() leftSlideButtonText: string;
  @Input() leftSlideButtonStyle: string;
  @Input() rightSlideButtonText: string;
  @Input() rightSlideButtonStyle: string;
  @Output() rightSlideButtonClick = new EventEmitter<number>();
  @Output() leftSlideButtonClick = new EventEmitter<number>();

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {}

  rightClicked(rowNumber, slidingEl: IonItemSliding) {
    slidingEl.closeOpened();
    this.rightSlideButtonClick.emit(rowNumber);
  }

  leftClicked(rowNumber, slidingEl: IonItemSliding) {
    slidingEl.closeOpened();
    this.leftSlideButtonClick.emit(rowNumber);
  }

}
