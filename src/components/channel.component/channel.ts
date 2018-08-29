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
    selector: 'channel',
    templateUrl: 'channel.html',
    styleUrls: ['channel.scss']
})

export class ChannelComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
                public loaderService: LoaderService,
                public location: Location,
                public authService: AuthenticationService,
                public snackBarService: OpenSnackBarService) {
    }


    public submitted: boolean;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {

        this.submitted = false;

    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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

    public ForgetAccess(): void {
        this.router.navigateByUrl("/retrieve").then();
    }

    public SignUp(): void {
        this.router.navigateByUrl("/signUp").then();
    }

}
