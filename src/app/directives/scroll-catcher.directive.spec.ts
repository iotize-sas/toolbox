import { ScrollCatcherDirective } from './scroll-catcher.directive';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ScrollCatcherDirective', () => {

  let component: TestScrollCatcherComponent;
  let fixture: ComponentFixture<TestScrollCatcherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestScrollCatcherComponent, ScrollCatcherDirective]
    });
    fixture = TestBed.createComponent(TestScrollCatcherComponent);
    component = fixture.componentInstance;
  });
  // WIP check if used and how to test
});

// Mock component

@Component( {
  template: ''
})

class TestScrollCatcherComponent {}