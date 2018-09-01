import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpModule} from '@angular/http';
import {Location} from '@angular/common'
import {Router, ActivatedRoute, Params} from '@angular/router';
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {LoaderService} from '../../services/loader.service';
import {AuthenticationService} from '../../services/authentication.service';
import {NgForm, FormGroup, FormControl, Validators} from '@angular/forms'
import {OpenSnackBarService} from "../../services/openSnackbar.service";
import {UserDataService, User} from "../../services/data.service";
import {HomeComponent} from '../home.component/home'

@Component({
    selector: 'channelAdd',
    templateUrl: 'channelAdd.html',
    styleUrls: ['channelAdd.scss']
})

export class ChannelAddComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
                public route: ActivatedRoute,
                public loaderService: LoaderService,
                public location: Location,
                public data: UserDataService,
                public authService: AuthenticationService,
                public snackBarService: OpenSnackBarService) {
    }

    public channelName: any;
    public selectGroup: string;
    public groups: any[];
    public addFormGroup: FormGroup;
    public submitted: boolean;

    public channelInfo: any;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {
        this.channelName = '';
        this.selectGroup = '';
        this.groups = [];

        this.addFormGroup = new FormGroup({
            channelName: new FormControl("", [
                Validators.required
            ]),
            selectGroup: new FormControl("", [
                Validators.required
            ])
        });
        this.submitted = false;

        this.FetchUser();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public FetchUser(): void {
        this.loaderService.isLoading(true);
        let userId = localStorage.getItem("userId");

        let sub = this.authService.SecurityAJAXGet(this.authService.FetchUser + userId)
            .subscribe(
                (res: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    this.data.setProfile = {...res.json().userInfo};
                    HomeComponent.updateUser.next(true);
                    this.groups = res.json().userInfo.groups
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("user info fetching fail:", error.status);
                }
            );

    }

    public SubmitChannel(addForm: NgForm): void {
        if (addForm.valid && !this.submitted) {

            this.submitted = true;

            this.loaderService.isLoading(true);

            let body = {
                group: this.selectGroup,
                channelName: this.channelName,
                userId: localStorage.getItem('userId')
            };

            let sub = this.authService.SecurityAJAXPost(this.authService.CreateChannel, body).subscribe(
                (res: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.loaderService.isLoading(false);
                    this.FetchUser();
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Channel create successfully');
                },
                (error: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.loaderService.isLoading(false);
                    if (error.status === 409) {
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Channel name already exist, please change one')
                    } else {
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to create new, please try again later')
                    }
                }
            );
        }
    }

}
