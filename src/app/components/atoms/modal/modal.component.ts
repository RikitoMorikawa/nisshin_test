import { Component, OnInit } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { ModalProperties } from 'src/app/services/modal.service';
import { modalConst } from 'src/app/const/modal.const';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit {
  properties!: ModalProperties;
  okButtonClickValue = modalConst.BUTTON_CLICK_VALUE.OK_BUTTON_CLICK_VALUE;
  cancelButtonClickValue =
    modalConst.BUTTON_CLICK_VALUE.CANCEL_BUTTON_CLICK_VALUE;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.properties = this.modalService.getModalProperties();
  }

  public onCloseModal(choice: string) {
    this.modalService.requestCloseModal(choice);
  }
}
