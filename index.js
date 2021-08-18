const express = require('express')
const app = express()
const port = 3000

const connect = require("./schemas");
connect();

app.use(express.urlencoded({extended: false}))
app.use(express.json()) //데이터 가공 용도 미들웨어
app.use(express.static('public')); //static 정적 자산 미들웨어

const goodsRouter = require("./routers/goods");
app.use("/api", [goodsRouter]);

app.use((req, res, next) => {
    console.log(req);
    next();
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs'); //템플릿 엔진 ejs를 사용하겠다.

app.get('/test', (req, res) => {
  let name = req.query.name;
  res.render('test', {name});
})

app.get('/', (req, res) => {
    res.send('<!DOCTYPE html>\
    <html lang="en">\
    <head>\
        <meta charset="UTF-8">\
        <meta http-equiv="X-UA-Compatible" content="IE=edge">\
        <meta name="viewport" content="width=device-width, initial-scale=1.0">\
        <title>Document</title>\
    </head>\
    <body>\
        Hi. I am with html<br>\
        <a href="/hi">Say Hi!</a>\
    </body>\
    </html>')
})

app.get('/home', (req, res) => {
    res.render('index');
})

app.get('/detail', (req, res) => {
    res.render('detail');
})

app.get('/cart', (req,res) =>{
    res.render('cart');
})

app.get('/order', (req, res) => {
    res.render('order');
})

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
  })