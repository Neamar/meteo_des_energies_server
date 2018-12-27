'use strict';

const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const dataRoute = require('./data.js');

router.get('/data', dataRoute);

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(process.env.PORT || 3000);
