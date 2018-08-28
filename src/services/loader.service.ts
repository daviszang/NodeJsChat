import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class LoaderService {
  constructor() {
  }

  /* Loading status for observing*/
  public loading = new Subject<any>();

  /* Setter for loading status using in components*/
  public isLoading(state: boolean) {
    this.loading.next(state);
  }

  /*Getter for loading status using in loader components*/
  public getLoading(): Observable<any> {
    return this.loading.asObservable();
  }

}
