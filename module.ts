import { Module, ModuleManager } from "../../API/Module";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response, Application } from 'express';
import { Logger } from "../../API/Logging";
import { HttpException } from "../../API/Routing";

class BaseModule extends Module
{
    constructor()
    {
        super("Basic Error Pages", fs.readFileSync(path.resolve(__dirname, "./version.txt")).toString("utf-8"));
        this.RegisterAppIntegration((app: Application) => 
        {
            app.use((req, res, next) =>
            {
                var err = new HttpException('Not Found');
                err.status = 404;
                next(err);
            });
    
            app.use((err: HttpException, req: Request, res: Response, next: NextFunction) => {
                app.set('views', __dirname);
                res.status((err.status || 500) as number);
    
                if (err.status == 404)
                {
                    // respond with html page
                    if (req.accepts('html')) 
                    {
                        res.render('views/404', { url: req.url, status: err.status, error: err.message });
                        return;
                    }
        
                    // respond with json
                    if (req.accepts('json')) 
                    {
                        res.json({ error: 'Not found' });
                        return;
                    }

                    // default to plain-text. send()
                    res.type('txt').send('Not found');
                    return;
                }
                else
                {
                    // respond with html page
                    if (req.accepts('html')) {
                        res.render('views/5xx', { url: req.url, error: err.stack, error_msg: err.message, status: res.statusCode });
                        return;
                    }
        
                    // respond with json
                    if (req.accepts('json')) {
                        res.json({ error: err.stack, status: res.statusCode });
                        return;
                    }
        
                    // default to plain-text. send()
                    res.type('txt').send(err.stack);
                }

                Logger.error(err.message, err.stack);
            });
        });
    }
}

ModuleManager.RegisterModule(new BaseModule());