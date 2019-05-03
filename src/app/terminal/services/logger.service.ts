import { Subject, ReplaySubject, Observer } from 'rxjs';
import { skip } from 'rxjs/operators';

import { Injectable } from '@angular/core';

export interface Logline {
  level: 'info' | 'error';
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  public static LineSeparator = '\r\n';

  logLinesHistory$: ReplaySubject<Logline>;
  logLines$: Subject<Logline>;
  lastLogLevel?: 'info' | 'error';
  private lineCount = 0;

  constructor() {
    this.logLinesHistory$ = new ReplaySubject<Logline>();
    this.logLines$ = new Subject<Logline>();
  }

  log(level: 'info' | 'error', string: string) {
    console[level](`[${level.toUpperCase()}] : ${string}`);

    if (level === 'error') {
      string += LoggerService.LineSeparator;
      if (this.lastLogLevel === 'info') {
        string = LoggerService.LineSeparator + string;
      }
    }
    this.lineCount++;

    this.logLines$.next({
      level: level,
      message: string
    });
    this.lastLogLevel = level;
  }

  getLogLinesObservable() {
    return this.logLines$.asObservable();
  }

  clearHistory() {
    this.logLinesHistory$.complete();
    this.logLinesHistory$ = new ReplaySubject<Logline>();
    this.initLogLinesSubject();
  }

  private initLogLinesSubject() {
    let observer: Observer<Logline> = {
      next: line => {
        this.logLines$.next(line);
      },
      error: error => {
        console.error(error);
      },
      complete: () => {
        console.debug("[initLogLinesSubject]: longLinesHistory completed")
      }
    }
    this.logLinesHistory$.subscribe(observer);
  }
}
