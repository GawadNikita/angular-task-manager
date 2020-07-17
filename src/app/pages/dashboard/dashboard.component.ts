import { Component, OnInit, ViewEncapsulation} from '@angular/core';
import * as userTasks from '../../../../db.json';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {
  user : any = (userTasks as any).default.user;
  tickets : any = (userTasks as any).default.ticket;
  type : any = (userTasks as any).default.type;
  status : any = (userTasks as any).default.status;
  tabNames : any;
  activeTab: string = "Bug";
  previousTab: string;
  result: any;
  page = 1;
  pageSize = 10;
  tabEventData : any;
  tabClass=['fa-list','fa-bug', 'fa-hourglass-end', 'fa-hourglass-half', 'fa-hourglass-start'];

  successAlert = new Subject<string>();
  staticAlertClosed = false;
  successMessage = '';
  constructor() { }

  ngOnInit() {
    this.getCount(this.tickets);
    this.getActiveTab(this.activeTab);
    setTimeout(() => this.staticAlertClosed = true, 20000);
    this.successAlert.subscribe(message => this.successMessage = message);
    this.successAlert.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = '');
  }
  
  getCount = (arr) =>{
    this.type.forEach(type =>{
      type["count"] = 0;
      arr.filter(ticket =>{
        if(ticket.type == type.id){ type.count++; }
      })
    })
    this.status.forEach(status =>{
      status["count"] = 0;
      arr.filter(ticket =>{
        if(ticket.status == status.id){ status.count++; }
      })
    })
    this.tabNames = [...this.type,...this.status];
    this.status.forEach((status) =>{
      this.user.forEach(user =>{
        user[status.name] = status.count;
      })
    })  
    this.getUserStatus();
    this.updateTaskClass();
  }

  updateTaskClass = ()=> {
    this.tabClass.forEach( (className, index) =>{
      this.tabNames.forEach((tab, i) =>{
        if(index == i){
          tab["className"] = this.tabClass[index]
        }
      })
    })
  }

  getUserStatus = ()=>{
    this.user.forEach(user =>{
      if(user.InProgress != 0) { user.status= 2; return;}
      else if(user.NotStarted !=0){user.status = 3; return;}
      else{ user.status =1; return;}
    })
  }

  getActiveTab = (tabName?:any, tabEvent?:any) =>{
    if(tabEvent){
      this.previousTab = tabEvent.activeId;
    }
    this.result=[];
    if(tabName){
      this.getFilterByName(tabName);
      this.getStatusByName(tabName); 
    }
  }
  getTabName = (tabName) =>{
    this.result =[];
  }

  getFilterByName = (value) =>{
    this.type.filter((type) =>{
      if(type.friendlyName == value){
        this.filterByType(type.id);
      }
    })
  }

  getStatusByName = (value) =>{
    this.status.forEach((status) => {
      if(status.friendlyName ==  value){ 
        this.filterByStatus(status.id);
      }
    });
  }

  filterByType = (value) =>{
    this.result =[];
    this.result = this.tickets.filter((ticket) =>{
      return ticket.type == value;
    })
  }
  filterByStatus = (value) =>{
    this.result =[];
    this.result = this.tickets.filter((ticket) =>{
      return ticket.status == value;
    })
  }
  updateStatus = (ticket, tab) => {
    this.getCount(this.tickets);
    this.getActiveTab(tab);
    this.showAlert();
  }

  showAlert = () =>{
    this.successAlert.next("Ticket status changed successfully.")
    
  }
}
