import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from '../components/login.component/login';
import {HomeComponent} from '../components/home.component/home';
import {ChannelComponent} from '../components/channel.component/channel';
import {GroupsComponent} from "../components/groups.component/groups";

const appRoutes: Routes = [
    {
        path: "login",
        component: LoginComponent,
    },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            {
                path: "groups",
                component: GroupsComponent
            },
            {
                path: "groups/:channel",
                component: ChannelComponent,
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'groups'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];


export const appRoutingProviders: any[] = [];
export const routing = RouterModule.forRoot(appRoutes);
