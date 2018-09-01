import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from '../components/login.component/login';
import {HomeComponent} from '../components/home.component/home';
import {ChannelComponent} from '../components/channel.component/channel';
import {GroupsComponent} from "../components/groups.component/groups";
import {GroupAddComponent} from "../components/groupAdd.component/groupAdd";
import {ChannelAddComponent} from "../components/channelAdd.component/channelAdd";

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
                path: "group/:groupId",
                component: GroupsComponent
            },
            {
                path: "groups/new",
                component: GroupAddComponent
            },
            {
                path: "channels/new",
                component: ChannelAddComponent
            },
            {
                path: "channel/:channelId",
                component: ChannelComponent,
            },
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'groups/new'
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
