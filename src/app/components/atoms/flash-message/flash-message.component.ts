import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  AfterViewInit,
} from '@angular/core';
import { FlashMessageService } from 'src/app/services/flash-message.service';
import { FlashMessageProperties } from '../../../services/flash-message.service';

@Component({
  selector: 'app-flash-message',
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.scss'],
})
export class FlashMessageComponent implements OnInit {
  properties!: FlashMessageProperties;
  constructor(private flashMessageService: FlashMessageService) {}

  ngOnInit(): void {
    this.properties = this.flashMessageService.getFlashMessageProperties();
    setTimeout(() => {
      console.log('タイムアウト');
      this.closeFlashMessage();
    }, this.properties.timeOut);
  }

  /*
  ngAfterViewInit(): void {
    setTimeout(() => {
      console.log('タイムアウト');
      this.closeFlashMessage();
    }, this.properties.timeOut);
  }
  */

  public closeFlashMessage() {
    console.log('閉じる');
    this.flashMessageService.requestCloseFlashMessage();
  }
}
