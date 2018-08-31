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

@Component({
    selector: 'chatGroups',
    templateUrl: 'groups.html',
    styleUrls: ['groups.scss']
})

export class GroupsComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
                public route: ActivatedRoute,
                public loaderService: LoaderService,
                public location: Location,
                public authService: AuthenticationService,
                public snackBarService: OpenSnackBarService) {
    }


    public submitted: boolean;
    public groupInfo: any;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {
        this.submitted = false;
        this.FetchGroup()
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public FetchGroup(): void {
        let groupId = "";
        this.route.params.subscribe((params: Params) => {
            groupId = params['groupId'];
            this.loaderService.isLoading(true);
            let sub = this.authService.SecurityAJAXGet(this.authService.FetchGroup + groupId)
                .subscribe(
                    (res: any) => {
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        this.groupInfo = res.json().group;
                    },
                    (error: any) => {
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        console.log("user info fetching fail:", error.status);
                    }
                );
        })
    }

    public CheckAdmin() {
        let localuser = localStorage.getItem('userId');
        if (localuser == this.groupInfo.admin._id)
            return true;
        else
            return false
    }

    public AddUser(): void {

    }

    public DeleteUser(userId): void {
        this.loaderService.isLoading(true);
        let sub = this.authService.SecurityAJAXDelete(this.authService.DeleteUser + userId)
            .subscribe(
                (res: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Delete Successfully');
                    this.FetchGroup()
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("delete fail:", error.status);
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to delete, please try again');
                }
            );
    }
}
