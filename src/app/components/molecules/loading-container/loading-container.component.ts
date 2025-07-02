import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading-container',
  templateUrl: './loading-container.component.html',
  styleUrls: ['./loading-container.component.scss'],
})
export class LoadingContainerComponent implements OnInit {
  @Input() isLoading!: boolean;

  constructor() {}

  ngOnInit(): void {
    console.log('loading...');
  }
}
