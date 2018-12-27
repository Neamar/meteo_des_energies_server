'use strict';

const Koa = require('koa');
const energy = require('./energy.js');

const app = new Koa();


// response
app.use(async(ctx) => {
  ctx.body = await energy();
});

app.listen(process.env.PORT || 3000);
