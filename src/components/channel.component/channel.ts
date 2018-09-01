import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpModule} from '@angular/http';
import {Location} from '@angular/common'
import {Router, ActivatedRoute, Params} from '@angular/router';
import {Observable} from "rxjs/Observable";
import {MatDialog} from '@angular/material';
import {Subscription} from "rxjs/Subscription";
import {LoaderService} from '../../services/loader.service';
import {AuthenticationService} from '../../services/authentication.service';
import {NgForm, FormGroup, FormControl, Validators} from '@angular/forms'
import {OpenSnackBarService} from "../../services/openSnackbar.service";
import {DialogComponent} from '../dialog/dialog';
import {UserDataService, User} from "../../services/data.service";
import {HomeComponent} from '../home.component/home'


@Component({
    selector: 'channel',
    templateUrl: 'channel.html',
    styleUrls: ['channel.scss']
})

export class ChannelComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
                public route: ActivatedRoute,
                public loaderService: LoaderService,
                public location: Location,
                public dialog: MatDialog,
                public data: UserDataService,
                public authService: AuthenticationService,
                public snackBarService: OpenSnackBarService) {
    }


    public submitted: boolean;
    public members: any[];
    public isAdmin: boolean;
    public channelInfo: any;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {
        this.isAdmin = false;
        this.members = [];
        this.submitted = false;
        this.channelInfo = {
            members: [{_id: "", username: ""}],
            _id: "",
            group: {_id: "", admin: ""},
            channelName: "",
            conversation: []
        };
        this.FetchChannel()
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public FetchChannel(): void {
        let channelId = "";
        this.route.params.subscribe((params: Params) => {
            channelId = params['channelId'];
            this.loaderService.isLoading(true);
            let sub = this.authService.SecurityAJAXGet(this.authService.FetchChannel + channelId)
                .subscribe(
                    (res: any) => {
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        this.channelInfo = res.json().channel;
                        this.members = this.channelInfo.members;
                    },
                    (error: any) => {
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        console.log("channel fetching fail:", error.status);
                    }
                );
        })
    }

    public CheckAdmin() {
        let localuser = localStorage.getItem('userId');
        if (localuser == this.channelInfo.group.admin) {
            return true
        } else {
           return false
        }
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
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("user info fetching fail:", error.status);
                }
            );

    }

    public AddUser(): void {
        const dialogRef = this.dialog.open(DialogComponent, {
            data: {
                channelId: this.channelInfo._id,
                groupId: this.channelInfo.group._id
            }
        });

        dialogRef.afterClosed().subscribe(data => {
            if (data == undefined) {
                console.log("cancel request");
            } else {
                console.log('The dialog output:', data);
                this.FetchChannel();
            }
        });
    }

    public DeleteUser(user): void {
        let body = {
            channelId: this.channelInfo._id,
            userId: user
        };

        let sub = this.authService.SecurityAJAXPost(this.authService.DeleteChannelUser, body)
            .subscribe(
                (res: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Delete Successfully');
                    this.FetchChannel();
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("delete fail:", error.status);
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to delete, please try again');
                }
            );

    }

    public DeleteChannel(id): void {
        let sub = this.authService.SecurityAJAXDelete(this.authService.DeleteChannel + id)
            .subscribe(
                (res: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Delete Successfully');
                    this.FetchUser();
                    this.router.navigateByUrl('/home')
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("delete fail:", error.status);
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to delete, please try again');
                }
            );
    }

    public OnSubmit(loginDataForm: NgForm): void {
        if (loginDataForm.valid && !this.submitted) {

            this.submitted = true;

            this.loaderService.isLoading(true);

            let body = {};

            let sub = this.authService.SecurityAJAXPost(this.authService.Login, body).subscribe(
                (res: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.authService._token = res.json().token;
                    this.loaderService.isLoading(false);
                },
                (error: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.loaderService.isLoading(false);
                },
            );
        }
    }

}
