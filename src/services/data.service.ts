import {Injectable} from '@angular/core';

export class User {
    userId: string;
    username: string;
    email: string;
    superAdmin: boolean;
    channels: any[];
    groups: any[]
}

@Injectable()
export class UserDataService {
    private _profile: User;

    get getProfile() {
        return this._profile;
    }


    set setProfile(profile: User) {
        this._profile = profile;
    }


    constructor() {
        this._profile = {
            email: "",
            userId: "",
            superAdmin: false,
            username: "",
            groups: [],
            channels: []
        }
    }
}