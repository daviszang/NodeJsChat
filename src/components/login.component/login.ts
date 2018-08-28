import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpModule} from '@angular/http';
import {Location} from '@angular/common'
import {Router} from '@angular/router';
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {LoaderService} from '../../services/loader.service';
import {AuthenticationService} from '../../services/authentication.service';
import {NgForm, FormGroup, FormControl, Validators} from '@angular/forms'
import {OpenSnackBarService} from "../../services/openSnackbar.service";


const INCORRECT_CREDENTIAL = "The username or password you entered is incorrect.";
const SERVICE_FAIL = "Login service is currently unavailable. Please try again later.";

@Component({
    selector: 'login',
    templateUrl: 'login.html',
    styleUrls: ['login.scss']
})

export class LoginComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
                public loaderService: LoaderService,
                public location: Location,
                public authService: AuthenticationService,
                public snackBarService: OpenSnackBarService) {
    }

    public credentials: any;
    public loginFormGroup: FormGroup;
    public submitted: boolean;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {

        this.submitted = false;

        this.loginFormGroup = new FormGroup({
            email: new FormControl("", [
                Validators.required
            ]),
            password: new FormControl("", [
                Validators.required,
            ])
        });
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public OnSubmit(loginDataForm: NgForm): void {
        if (loginDataForm.valid && !this.submitted) {

            this.submitted = true;

            this.loaderService.isLoading(true);

            let body = {
                email: this.credentials["email"],
                password: this.credentials["password"]
            };

            let sub = this.authService.SecurityAJAXPost(this.authService.Login, body).subscribe(
                (res: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.authService._token = res.json().token;
                    this.loaderService.isLoading(false);

                    if (res) {
                        localStorage.setItem("email", this.credentials["username"]);
                        sessionStorage.setItem("token", res.json().token);
                        this.router.navigateByUrl('/home');
                    }
                    else {
                        this.credentials["password"] = "";
                        this.snackBarService.OpenTopSnackBar("alert", 3000, SERVICE_FAIL);
                    }
                },
                (error: any) => {
                    this.subscriptions.add(sub);
                    this.submitted = false;
                    this.loaderService.isLoading(false);
                    this.credentials["password"] = "";
                    if (error.status === 401)
                        this.snackBarService.OpenTopSnackBar("alert", 3000, INCORRECT_CREDENTIAL);
                    else if (error.status === 403)
                        this.router.navigateByUrl("/locked").then();
                    else
                        this.snackBarService.OpenTopSnackBar("alert", 3000, SERVICE_FAIL);
                },
            );
        }
    }

    public ForgetAccess(): void {
        this.router.navigateByUrl("/retrieve").then();
    }

    public SignUp(): void {
        this.router.navigateByUrl("/signUp").then();
    }

}
