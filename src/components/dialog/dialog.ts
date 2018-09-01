import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {AuthenticationService} from '../../services/authentication.service';
import {Subscription} from "rxjs/Subscription";
import {OpenSnackBarService} from "../../services/openSnackbar.service";
import {LoaderService} from '../../services/loader.service';
import {NgForm, FormGroup, FormControl, Validators} from '@angular/forms'


const SERVICE_SUCCESS = "You send a request successfully!";
const SERVICE_FAIL = "This service is currently unavailable. Please try again later.";


@Component({
    selector: 'Chat-dialog',
    templateUrl: 'dialog.html',
    styleUrls: ['dialog.scss']
})

export class DialogComponent implements OnInit, OnDestroy {

    constructor(public dialogRef: MatDialogRef<DialogComponent>,
                private authService: AuthenticationService,
                public loaderService: LoaderService,
                public snackBarService: OpenSnackBarService,
                @Inject(MAT_DIALOG_DATA) public data: any) {
    }

    private subscriptions: Subscription = new Subscription();

    public members: any[];
    public addFormGroup: FormGroup;
    public selectUser: string;

    ngOnInit(): void {
        this.FetchUserList();

        this.selectUser = '';

        this.addFormGroup = new FormGroup({
            selectUser: new FormControl("", [
                Validators.required
            ])
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public FetchUserList(): void {
        let groupId = this.data.groupId;
        this.loaderService.isLoading(true);
        let sub = this.authService.SecurityAJAXGet(this.authService.FetchGroup + groupId)
            .subscribe(
                (res: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    this.members = res.json().group.members;
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("user info fetching fail:", error.status);
                }
            );
    }

    public Cancel(): void {
        this.dialogRef.close();
    }

    public AddUser(): void {
        let body = {
            channelId: this.data.channelId,
            userId: this.selectUser
        };

        let sub = this.authService.SecurityAJAXPost(this.authService.AddUserToChannel, body)
            .subscribe(
                (res: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    this.dialogRef.close('add');
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Add User Successfully');
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("delete fail:", error.status);
                    this.dialogRef.close();
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to add, please try again');
                }
            );

    }
}
