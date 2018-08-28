import {Injectable} from '@angular/core';
import {PlatformLocation} from '@angular/common';
import {Http, Headers, Response, RequestOptions, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx'

export interface IHttpGetParam {
    key: string;
    value: string;
}

const AUTH_CONTENT_TYPE_KEY = "Content-Type";
const AUTH_CONTENT_TYPE = "application/json;charset=utf-8";
const AUTH_HEADER_KEY = "Authorization";
const AUTH_TOKEN_PREFIX = "Bearer ";

@Injectable()
export class AuthenticationService {
    public baseURL: string;
    public _token: string;

    private _fetchUser: string;
    private _Login: string;
    private _Signup: string;
    private _userLogout: string;


    get Token() {
        return sessionStorage.getItem("token") || this._token;
    }

    get Login() {
        return this._Login
    }

    get Signup() {
        return this._Signup
    }

    get UserLogout() {
        return this._userLogout
    }

    get FetchUser() {
        return this._fetchUser
    }

    constructor(public http: Http, public platformLocation: PlatformLocation) {
        this.baseURL = window.document.location.origin + this.platformLocation.getBaseHrefFromDOM();
        this._Login = this.baseURL + "/login";
        this._Signup = "";
        this._fetchUser = "";
    }

    /* Security GET with header */
    public SecurityAJAXGet(url: string, params?: IHttpGetParam[]): Observable<Response> {
        let headers = new Headers();
        let reqOpts = new RequestOptions();
        let searchParams = new URLSearchParams();

        if (this.Token)
            headers.append(AUTH_HEADER_KEY, AUTH_TOKEN_PREFIX + this.Token);
        if (params && params.length > 0)
            params.forEach(param => {
                searchParams.append(param.key, param.value);
            });
        reqOpts.headers = headers;
        reqOpts.search = searchParams;

        return this.http.get(url, reqOpts).timeout(60000).map((res: Response) => res)
            .catch((err: Response) => {
                return Observable.throw(err)
            });
    }

    /* Security POST with header */
    public SecurityAJAXPost(url: string, data: any, headerOpts?: object): Observable<Response> {
        let headers = new Headers();
        let reqOpts = new RequestOptions();

        headers.append(AUTH_CONTENT_TYPE_KEY, AUTH_CONTENT_TYPE);
        if (headerOpts) {
            headers.delete(AUTH_CONTENT_TYPE_KEY);
            Object.keys(headerOpts).forEach(key => {
                headers.append(key, headerOpts[key]);
            });
        }
        if (this.Token) {
            headers.append(AUTH_HEADER_KEY, AUTH_TOKEN_PREFIX + this.Token);
        }
        reqOpts.headers = headers;

        return this.http.post(url, JSON.stringify(data), reqOpts).timeout(60000).map((res: Response) => res)
            .catch((err: Response) => {
                return Observable.throw(err)
            });
    }

    /* Security PUT with header */
    public SecurityAJAXPut(url: string, data: any, headerOpts?: object): Observable<Response> {
        let headers = new Headers();
        let reqOpts = new RequestOptions();

        headers.append(AUTH_CONTENT_TYPE_KEY, AUTH_CONTENT_TYPE);
        if (headerOpts) {
            headers.delete(AUTH_CONTENT_TYPE_KEY);
            Object.keys(headerOpts).forEach(key => {
                headers.append(key, headerOpts[key]);
            });
        }
        if (this.Token) {
            headers.append(AUTH_HEADER_KEY, AUTH_TOKEN_PREFIX + this.Token);
        }
        reqOpts.headers = headers;

        return this.http.put(url, JSON.stringify(data), reqOpts).timeout(60000).map((res: Response) => res)
            .catch((err: Response) => {
                return Observable.throw(err)
            });
    }

    /* Security DELETE with header */
    public SecurityAJAXDelete(url: string, data?: any): Observable<Response> {
        let headers = new Headers();
        let reqOpts = new RequestOptions();

        if (this.Token) {
            headers.append(AUTH_HEADER_KEY, AUTH_TOKEN_PREFIX + this.Token);
        }
        reqOpts.headers = headers;
        if (data) {
            reqOpts.body = data;
        }

        return this.http.delete(url, reqOpts).timeout(60000).map((res: Response) => res)
            .catch((err: Response) => {
                return Observable.throw(err)
            });
    }
}
