import { AttachmentAppIntegration, Module, ModuleManager } from "../../API/Modules/Module";
import fs from "fs";
import path from "path";
import { NextFunction, Request, Response, Application } from 'express';
import { HttpException, Route } from "../../API/Routing/Routing";
import { Logger } from "../../API/Common/Logging";

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
                    if (req.accepts('html'))
                    {
                        return Route.SafeRender(res, 'views/404', { url: req.url, status: err.status, error: err.message });
                    }

                    return res.json({ url: req.url, status: err.status, error: err.message });
                }
                else
                {
                    if (req.accepts('html'))
                    {
                        try {
                            return Route.SafeRender(res, 'views/5xx', { url: req.url, error: err.stack, error_msg: err.message, status: res.statusCode });
                        } catch (error) {
                            Logger.error("Fatal Error with the Error Catcher ::>",error);
                        }
                    }

                    return res.json({ url: req.url, error: err.stack, error_msg: err.message, status: res.statusCode });
                }
            });
        }, AttachmentAppIntegration.POST);
    }
}

ModuleManager.RegisterModule(new BaseModule());