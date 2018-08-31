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

@Component({
    selector: 'groupAdd',
    templateUrl: 'groupAdd.html',
    styleUrls: ['groupAdd.scss']
})

export class GroupAddComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
                public route: ActivatedRoute,
                public loaderService: LoaderService,
                public location: Location,
                public data: UserDataService,
                public authService: AuthenticationService,
                public snackBarService: OpenSnackBarService) {
    }

    public groupName: any;
    public addFormGroup: FormGroup;
    public submitted: boolean;
    public groupInfo: any;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {
        this.submitted = false;
        this.groupName = '';
        this.addFormGroup = new FormGroup({
            groupName: new FormControl("", [
                Validators.required
            ])
        });
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
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("user info fetching fail:", error.status);
                }
            );

    }

    public SubmitGroup(addForm: NgForm): void {
        if (addForm.valid && !this.submitted) {

            this.submitted = true;

            this.loaderService.isLoading(true);

            let body = {
                name: this.groupName,
                userId: localStorage.getItem('userId')
            };

            let sub = this.authService.SecurityAJAXPost(this.authService.CreateGroup, body).subscribe(
                (res: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.loaderService.isLoading(false);
                    this.FetchUser();
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Group create successfully');
                },
                (error: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.loaderService.isLoading(false);
                    if (error.status === 409) {
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Group name already exist, please change one')
                    } else {
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to create new, please try again later')
                    }
                }
            );
        }
    }

}
