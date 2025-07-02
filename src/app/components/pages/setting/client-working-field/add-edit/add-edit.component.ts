import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientWorkingFieldService } from 'src/app/services/client-working-field.service';
import { regExConst } from 'src/app/const/regex.const';
import { catchError, finalize, Subscription } from 'rxjs';
import { ClientWorkingFieldApiResponse } from 'src/app/models/client-working-field';
import { ApiCallStatus } from '../../../master/template/add-edit/add-edit.component';
import { ApiInput } from 'src/app/components/molecules/real-time-suggest-container/real-time-suggest-container.component';
import { ClientApiResponse } from 'src/app/models/client';
import { ClientService } from 'src/app/services/client.service';
import { CommonService } from 'src/app/services/shared/common.service';
import { Employee } from 'src/app/models/employee';
import { AuthorService } from 'src/app/services/author.service';

@Component({
  selector: 'app-add-edit',
  templateUrl: './add-edit.component.html',
  styleUrls: ['./add-edit.component.scss'],
})
export class AddEditComponent implements OnInit {
  // オブザーバーを格納するためのSubscription
  private subscription = new Subscription();

  // ログイン中ユーザー
  author!: Employee;

  id = this.route.snapshot.params['id'];
  updater = '未登録';
  authorname = '';
  apiService = this.service;

  // フォームまわりの変数
  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    client_id: [
      '',
      [Validators.required, Validators.pattern(regExConst.NUMERIC_REG_EX)],
    ],
    client_name: '',
  });
  get fc() {
    return this.form.controls;
  }

  // コンストラクタ
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private common: CommonService,
    private service: ClientWorkingFieldService,
    private clientService: ClientService,
    private authorService: AuthorService
  ) {}

  /**
   * コンポーネントの初期化処理
   * @returns
   */
  ngOnInit(): void {
    // 新規登録なら戻す
    if (!this.id) {
      // ログイン中ユーザー取得処理
      if (this.authorService.author) {
        // authorServiceに値がある場合
        this.author = this.authorService.author;
        this.authorname = `${this.author.last_name} ${this.author.first_name}`;
      } else {
        // authorServiceに値がない場合
        // 購読を格納
        this.subscription.add(
          // ログイン中ユーザーを取得
          this.authorService.author$.subscribe((author) => {
            this.author = author;
            this.authorname = `${this.author.last_name} ${this.author.first_name}`;
          })
        );
      }
      return;
    }

    this.common.loading = true;
    this.service
      .find(this.id)
      .pipe(
        catchError(
          this.service.handleErrorModal<ClientWorkingFieldApiResponse>()
        ),
        finalize(() => (this.common.loading = false))
      )
      .subscribe((res) => {
        const field = res.data[0];
        this.form.patchValue(field as object);
        this.updater = `${field.employee_updated_last_name} ${field.employee_updated_first_name}`;
      });
  }
  /**
   * 編集テンプレのステータス変更に応じた処理
   * @param status 編集テンプレコンポーネントからの戻り値
   */
  listenStateChange(status: ApiCallStatus) {
    this.common.loading = !!status;
  }

  /**
   * 絞り込み用結果を取得
   * 得意先用
   * @returns
   */
  getSuggests(): ApiInput<ClientApiResponse> {
    return {
      observable: this.clientService.getAll({
        name: this.fc.client_name.value,
      }),
      idField: 'id',
      nameField: 'name',
    };
  }
}
