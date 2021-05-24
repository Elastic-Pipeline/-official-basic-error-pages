import { AttachmentAppIntegration, Module, ModuleManager } from "../../API/Module";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response, Application } from 'express';
import { HttpException } from "../../API/Routing";
import { Logger } from "../../API/Logging";

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
                return next(err);
            });
    
            app.use((err: HttpException, req: Request, res: Response, next: NextFunction) => {
                app.set('views', __dirname);
                res.status((err.status || 500) as number);
                if (err.status == 404)
                {
                    // respond with html page
                    if (req.accepts('html')) 
                    {
                        return res.render('views/404', { url: req.url, status: err.status, error: err.message });
                    }
        
                    // respond with json
                    if (req.accepts('json')) 
                    {
                        return res.json({ error: 'Not found' });
                    }

                    // default to plain-text. send()
                    return res.type('txt').send('Not found');
                }
                else
                {
                    // respond with html page
                    if (req.accepts('html')) 
                    {
                        return res.render('views/5xx', { url: req.url, error: err.stack, error_msg: err.message, status: res.statusCode });
                    }
        
                    // respond with json
                    if (req.accepts('json')) 
                    {
                        return res.json({ url: req.url, error: err.stack, error_msg: err.message, status: res.statusCode });
                    }
                    
                    // default to plain-text. send()
                    return res.type('txt').send(err.stack);
                }
            });
        }, AttachmentAppIntegration.POST);
    }
}

ModuleManager.RegisterModule(new BaseModule());