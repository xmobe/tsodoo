import { IOdooConfig, OdooXMLPRC } from '@xmobe/tsodoo';

const config: IOdooConfig = {
  url: '<https://yoururl.com>',
  db: 'db',
  username: 'username',
  password: 'password'
}

let odoo = new OdooXMLPRC(config);
odoo
  .connect()
  .then(result => {
    console.log('Connect successful', result);

    odoo.list('res.partner')
      .then(records => {
        console.log(records);
      })
      .catch(error => {
        console.log(error);
      });
  })
  .catch(error => {
    console.log(error);
  });
