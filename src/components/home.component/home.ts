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

@Component({
    selector: 'chatHome',
    templateUrl: 'home.html',
    styleUrls: ['home.scss']
})

export class HomeComponent implements OnInit, OnDestroy {
    constructor(private router: Router,
                public loaderService: LoaderService,
                public location: Location,
                public authService: AuthenticationService,
                public snackBarService: OpenSnackBarService) {
    }


    public submitted: boolean;
    public userInfo: any;
    private subscriptions: Subscription = new Subscription();

    ngOnInit(): void {
        this.submitted = false;

        this.userInfo = {
            "groups": [
                {
                    "_id": "5b88302ab670329cee6f7590",
                    "groupName": "group0"
                },
                {
                    "_id": "5b88302eb670329cee6f7591",
                    "groupName": "group1"
                },
                {
                    "_id": "5b883033b670329cee6f7592",
                    "groupName": "group2"
                }
            ],
            "channels": [
                {
                    "_id": "5b8865a05f0b1caeb9622eae",
                    "channelName": "channel1"
                },
                {
                    "_id": "5b8865a65f0b1caeb9622eaf",
                    "channelName": "channel2"
                }
            ],
            "_id": "5b883000b670329cee6f758f",
            "email": "super@123.com",
            "username": "super",
            "password": "$2b$10$W2EnxB0BYeQ62KPOaEDheeJ3JlCx2WdVK1cYaX1bCph3XdXg4vgES",
            "superAdmin": true,
            "__v": 0
        }

        /*this.FetchUser();*/
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
                    this.userInfo = res.json().userInfo;
                    this.snackBarService.OpenTopSnackBar("alert", 3000, 'Welcome back ' + this.userInfo.username);
                },
                (error: any) => {
                    this.loaderService.isLoading(false);
                    this.subscriptions.add(sub);
                    console.log("user info fetching fail:", error.status);
                }
            );

    }

    public Logout(): void {
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        this.snackBarService.OpenTopSnackBar("alert", 3000, 'You have successful logout');
        this.router.navigateByUrl('/login')
    }

}
