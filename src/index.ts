import * as url from "url";
import { createClient, createSecureClient, Client } from "xmlrpc";

export interface IOdooConfig {
  url?: string;
  host?: string;
  port?: string;
  db?: string;
  username?: string;
  password?: string;
  secure?: boolean;
  basic_auth?: { user: string; pass: string };
}

// need to remove, copy from xmlrpc
interface ClientOptions {
  host?: string;
  path?: string;
  port?: number;
  url?: string;
  cookies?: boolean;
  headers?: { [header: string]: string };
  basic_auth?: { user: string; pass: string };
  method?: string;
}
export class OdooXMLPRC {
  private _config: IOdooConfig;
  private _uid: any;
  private _client: any;

  static count: number = 0;
  constructor(private config: IOdooConfig) {
    this._config = {};

    if (config) {
      let urlparts: any = {};
      if (config.url) {
        urlparts = url.parse(config.url || "");
      }

      this._config = {
        host: urlparts.hostname,
        port: config.port || urlparts.port,
        db: config.db,
        username: config.username,
        password: config.password,
        secure: true
      };

      if (urlparts.protocol !== "https:") {
        this._config.secure = false;
      } else {
        this._config.port = this._config.port ?? "443"
      }
        
      if (urlparts.auth) {
        const [user, pass] = urlparts.auth.split(":");
        this._config.basic_auth = { user, pass };
      }
    } else {
      throw new Error("No configuration");
    }
  }

  public connect(): Promise<number> {
    return new Promise<any>((resolve, reject) => {
      const clientOptions: ClientOptions = {
        host: this._config.host,
        port: parseInt(this._config.port || "80"),
        path: "/xmlrpc/2/common",
        basic_auth: this._config.basic_auth,
      };

      let client: Client;

      if (this._config.secure === false) {
        client = createClient(clientOptions);
      } else {
        client = createSecureClient(clientOptions);
      }

      this._client = client;

      const params = [];
      params.push(this._config.db);
      params.push(this._config.username);
      params.push(this._config.password);
      params.push({});

      try {
        if (!this._uid) {
          this._client.methodCall("authenticate", params, (error: any, value: any) => {
            if (error) {
              reject(error);
            }
  
            if (!value) {
              reject(new Error("No UID returned from authentication"));
            }
  
            this._uid = value;
            OdooXMLPRC.count++;
  
            resolve(this._uid);
          });
        } else {
          resolve(this._uid);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  public create(model: string, params: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        this.execute_kw(model, "create", params)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  public update(model: string, params: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        this.execute_kw(model, "write", params)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  public delete(model: string, params: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        this.execute_kw(model, "unlink", params)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  public list(
    model: string,
    fields?: string[],
    offset?: number,
    limit?: number
  ): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      if (!fields) fields = [];
      if (!offset) offset = 0;
      if (!limit) limit = 10;

      const inParams = [];
      inParams.push([]);
      inParams.push(fields);
      inParams.push(offset);
      inParams.push(limit);
      var params = [];
      params.push(inParams);

      try {
        this.execute_kw(model, "search_read", params)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  public search(model: string, params: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        this.execute_kw(model, "search_read", params)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  public methodCall(model: string, method: string, params: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        this.execute_kw(model, method, params)
          .then(result => {
            resolve(result);
          })
          .catch(error => {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  private execute_kw(model: string, method: string, params: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const clientOptions: ClientOptions = {
        host: this._config.host,
        port: parseInt(this._config.port || "80"),
        path: "/xmlrpc/2/object"
      };

      let client: Client;

      if (this._config.secure === false) {
        client = createClient(clientOptions);
      } else {
        client = createSecureClient(clientOptions);
      }

      let oparams = [];
      oparams.push(this._config.db);
      oparams.push(this._uid);
      oparams.push(this._config.password);
      oparams.push(model);
      oparams.push(method);

      for (var i = 0; i < params.length; i++) {
        oparams.push(params[i]);
      }

      try {
        client.methodCall("execute_kw", oparams, function(error: any, value: any) {
          if (error) {
            reject(error);
          }

          resolve(value);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
