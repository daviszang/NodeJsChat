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
import {HomeComponent} from '../home.component/home'

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
    public addUser: boolean;
    public editAdmin: boolean;
    public credentials: any;
    public isAdmin: boolean
    public selectUser: string;
    public members: any[];
    public emailRegex: RegExp;
    public addFormGroup: FormGroup;
    public updateFormGroup: FormGroup;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {
        this.emailRegex = new RegExp("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$");
        this.credentials = {username: "", password: "", email: ""};
        this.selectUser = '';

        this.addFormGroup = new FormGroup({
            username: new FormControl("", [
                Validators.required
            ]),
            email: new FormControl("", [
                Validators.required,
                Validators.pattern(this.emailRegex)
            ]),
            password: new FormControl("", [
                Validators.required
            ])
        });

        this.updateFormGroup = new FormGroup({
            selectUser: new FormControl("", [
                Validators.required
            ])
        });

        this.addUser = false;
        this.submitted = false;
        this.editAdmin = false;

        this.groupInfo = {
            members: [{_id: "", username: ""}],
            _id: "",
            groupName: "",
            admin: {_id: "", username: ""}
        };

        this.isAdmin = false;

        this.FetchGroup();

        this.members = this.groupInfo.members;

        this.CheckAdmin();
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
                        this.members = this.groupInfo.members;
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
        if (localuser == this.groupInfo.admin._id) {
            return true;
        }
        else {
            return false
        }
    }

    public AddUser(): void {
        this.addUser = true;
    }

    public EditAdmin(): void {
        this.editAdmin = true;
    }

    public Cancel(option): void {
        if (option == 'user') {
            this.addUser = false;
        } else {
            this.editAdmin = false;
        }
    }

    public UpdateAdmin(updateForm: NgForm): void {
        if (updateForm.valid && !this.submitted) {
            this.submitted = true;
            this.loaderService.isLoading(true);
            let body = {
                email: this.credentials["email"],
                password: this.credentials["password"],
                username: this.credentials["username"],
                groupId: this.groupInfo._id
            };
            let sub = this.authService.SecurityAJAXPost(this.authService.UpdateAdmin, body)
                .subscribe(
                    (res: any) => {
                        this.submitted = false;
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Update Successfully');
                        this.FetchGroup()
                    },
                    (error: any) => {
                        this.submitted = false;
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        console.log("update fail:", error.status);
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to update, please try again');
                    }
                );
        }
    }

    public CreateUser(addForm: NgForm): void {
        if (addForm.valid && !this.submitted) {
            this.submitted = true;
            this.loaderService.isLoading(true);
            let body = {
                email: this.credentials["email"],
                password: this.credentials["password"],
                username: this.credentials["username"],
                groupId: this.groupInfo._id
            };
            let sub = this.authService.SecurityAJAXPost(this.authService.CreateUser, body)
                .subscribe(
                    (res: any) => {
                        this.submitted = false;
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Create Successfully');
                        this.FetchGroup()
                    },
                    (error: any) => {
                        this.submitted = false;
                        this.loaderService.isLoading(false);
                        this.subscriptions.add(sub);
                        console.log("add fail:", error.status);
                        this.snackBarService.OpenTopSnackBar("alert", 3000, 'Fail to create, please try again');
                    }
                );
        }
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

    public DeleteGroup(): void {
        let groupId = this.groupInfo._id;
        let sub = this.authService.SecurityAJAXDelete(this.authService.DeleteGroup + groupId)
            .subscribe(
                (res: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Delete Successfully');
                    this.router.navigateByUrl('/home');
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
