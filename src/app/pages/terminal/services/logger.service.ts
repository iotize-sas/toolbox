import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';

export interface Logline {
  level: 'info' | 'error' | 'log';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  public static LineSeparator = '\r\n';

  private logLines$: BehaviorSubject<Logline[]>;
  private logLines: Logline[] = [];
  lastLogLevel?: 'info' | 'error' | 'log';

  constructor() {
    this.logLines$ = new BehaviorSubject<Logline[]>([]);
  }

  log(level: 'info' | 'error' | 'log', string: string) {
    console[level](`[${level.toUpperCase()}] : ${string}`);

    if (level === 'error') {
      string += LoggerService.LineSeparator;
      if (this.lastLogLevel === 'info') {
        string = LoggerService.LineSeparator + string;
      }
    }
    this.logLines.push({
      level: level,
      message: string
    });
    this.lastLogLevel = level;

    this.updateLoglines();

  }

  getLogLinesObservable() {
    return this.logLines$.asObservable();
  }

  clearHistory() {
    this.logLines = [];
    this.updateLoglines();
  }

  private updateLoglines() {
    this.logLines$.next(this.logLines);
  }
}
