import {BrowserModule} from '@angular/platform-browser';
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MatGridListModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatRadioModule,
    MatButtonModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSidenavModule,
    MatExpansionModule
} from '@angular/material';
import {HttpModule} from '@angular/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {routing} from './app.routing';
import {AuthenticationService} from '../services/authentication.service';
import {LoaderService} from '../services/loader.service';
import {OpenSnackBarService} from '../services/openSnackbar.service';

import {AppComponent} from './app.component';
import {ChatComponent} from '../components/chat.component/chat';
import {LoginComponent} from '../components/login.component/login';
import {HomeComponent} from '../components/home.component/home';
import {LoaderComponent} from "../components/loader/loader";
import {GroupsComponent} from "../components/groups.component/groups";


@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HomeComponent,
        GroupsComponent,
        ChatComponent,
        LoaderComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatSnackBarModule,
        MatSlideToggleModule,
        MatSidenavModule,
        MatSelectModule,
        MatTooltipModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        routing,
    ],
    providers: [
        AuthenticationService,
        LoaderService,
        OpenSnackBarService
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent]
})
export class AppModule {
}
