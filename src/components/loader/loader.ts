import {Component} from '@angular/core';
import {LoaderService} from '../../services/loader.service';

/* Component declaration with loader html template */
@Component({
  selector: 'loader',
  template:
    `
    <div *ngIf="loading" class="overlay">
      <mat-progress-spinner class="spinner" color="primary" mode="indeterminate">
      </mat-progress-spinner>
    </div>
  `,
  styleUrls: ['loader.scss']
})

export class LoaderComponent {
  public loading: boolean = false;

  /* Show or hide spinner by observing loading status in service */
  constructor(public loaderService: LoaderService) {
    this.loaderService.getLoading().subscribe(event => {
      this.loading = event;
      if (this.loading)
        document.getElementsByTagName("html")[0].style.overflow = "hidden";
      else
        document.getElementsByTagName("html")[0].style.overflow = "inherit";
    });
  }
}
