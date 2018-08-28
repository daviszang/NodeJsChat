import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable()
export class OpenSnackBarService 
{
    private snackBarCfg: MatSnackBarConfig;
    
    constructor(public snackBar: MatSnackBar) 
    {
        this.snackBarCfg = new MatSnackBarConfig();
    }
    
    OpenTopSnackBar(panelClass: string, duration: number, content: string, action?: string): void 
    {
        this.snackBarCfg.panelClass = 'snack-bar-' + panelClass;
        this.snackBarCfg.verticalPosition = "top";
        this.snackBarCfg.duration = duration;
        if (action)
            this.snackBar.open(content, action, this.snackBarCfg);
        else
            this.snackBar.open(content, "", this.snackBarCfg);
    }

    OpenBottomSnackBar(panelClass: string, duration: number, content: string, action?: string): void 
    {
        this.snackBarCfg.panelClass = 'snack-bar-' + panelClass;
        this.snackBarCfg.verticalPosition = "bottom";
        this.snackBarCfg.duration = duration;
        if (action)
            this.snackBar.open(content, action, this.snackBarCfg);
        else
            this.snackBar.open(content, "", this.snackBarCfg);
    }

}