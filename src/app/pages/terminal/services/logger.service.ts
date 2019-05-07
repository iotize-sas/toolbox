import { Subject, ReplaySubject, Observer, Subscription } from 'rxjs';

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
  private logSubscription?: Subscription;
  // private lineCount = 0;

  constructor() {
    this.logLinesHistory$ = new ReplaySubject<Logline>();
    this.logLines$ = new Subject<Logline>();
    this.initLogLinesSubject();
  }

  log(level: 'info' | 'error', string: string) {
    console[level](`[${level.toUpperCase()}] : ${string}`);

    if (level === 'error') {
      string += LoggerService.LineSeparator;
      if (this.lastLogLevel === 'info') {
        string = LoggerService.LineSeparator + string;
      }
    }

    this.logLinesHistory$.next({
      level: level,
      message: string
    });
    this.lastLogLevel = level;

  }

  getLogLinesObservable() {
    return this.logLinesHistory$.asObservable();
  }

  clearHistory() {
    this.logLinesHistory$.complete();
    this.logLinesHistory$ = new ReplaySubject<Logline>();
    this.initLogLinesSubject();
  }

  private initLogLinesSubject() {
    console.log("[LoggerService] creating intermediate subject");
    let observer: Observer<Logline> = {
      next: line => {
        console.log("[initLogLinesSubject]: received new line");
        this.logLines$.next(line);
      },
      error: error => {
        this.log("error", error.message? error.message: error);
      },
      complete: () => {
        console.log("[initLogLinesSubject]: logLinesHistory completed");
      }
    }
    this.logSubscription = this.logLinesHistory$.subscribe(observer);
  }
}
