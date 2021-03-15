import { Component, OnInit } from '@angular/core';
import * as M from 'node_modules/materialize-css/js/materialize.min.js'



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor() { }
  public login: boolean = false;

  toggle(el,classname){
    if(el.classList.contains(classname)){
    el.classList.remove(classname)
    }
    else{
    el.classList.add(classname)
    }
  }
  // $(".info-item .btn").click(function () {
  //           $(".container").toggleClass("log-in");
  //       });
  //       $(".container-form .btn").click(function () {
  //           $(".container").addClass("active");
  //       });

  ngOnInit(): void {
    M.AutoInit();
  }

}
