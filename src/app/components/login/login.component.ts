import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as M from 'node_modules/materialize-css/js/materialize.min.js'



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(public formB: FormBuilder) { }

  public login: boolean = false;
  public success: boolean = false;
  public loading: boolean = false;
  public error: boolean = false;
  public formLogin: FormGroup;
  public formRegister: FormGroup;

  ngOnInit(): void {
    M.AutoInit();
    M.updateTextFields();
    this.formLogin = this.formB.group({
      user: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.formRegister = this.formB.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loginUser(){
    if (this.loading) return false;

    this.loading = !this.loading;
    setTimeout(() => {
      this.loading = !this.loading;
    }, 3000);
  }
}
