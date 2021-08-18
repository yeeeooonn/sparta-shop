const express = require("express");
const Goods = require("../schemas/goods");
const Cart = require("../schemas/cart");

const router = express.Router();

const cheerio = require("cheerio");
const axios = require("axios");
const iconv = require("iconv-lite");
const url =
  "http://www.yes24.com/24/Category/BestSeller";

router.get("/goods/add/crawling", async (req, res) => {
  try {
    await axios({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
     }).then(async (html) => {
       //크롤링코드
       const content = iconv.decode(html.data, "EUC-KR").toString();
       const $ = cheerio.load(content);
       const list = $("ol li");

       await list.each( async (i, tag) => {
            let desc = $(tag).find("p.copy a").text() 
            let image = $(tag).find("p.image a img").attr("src")
            let title = $(tag).find("p.image a img").attr("alt")
            let price = $(tag).find("p.price strong").text()

            if(desc && image && title && price){//이 값들이 모두 있을때만 추가하겠다.
              price = price.slice(0,-1).replace(/(,)/g,"") //가져오는 데이터를 goods 스키마에 맞게가공
              let date = new Date()
              let goodsId = date.getTime()//goodsId 는 유니크한 숫자값이여야하기때문에 시간을 숫자로가져와서 표현(임의로 다르게해도 가능)

              await Goods.create({
                goodsId:goodsId,
                name:title,
                thumbnailUrl:image,
                category:"도서",
                price:price
              })
            }
        })
    });
    res.send({ result: "success", message: "크롤링이 완료 되었습니다." });
        
  } catch (error) {
      console.log(error)
      res.send({ result: "fail", message: "크롤링에 문제가 발생했습니다", error:error });
    }
});

router.get("/goods", async (req, res, next) => { //get용도
    try {
      const { category } = req.query;
      const goods = await Goods.find({ category }).sort("-goodsId");
      res.json({ goods: goods });
    } catch (err) {
      console.error(err);
      next(err);
    }
});

router.get("/goods/:goodsId", async (req, res) => {
  const { goodsId } = req.params;
  goods = await Goods.findOne({ goodsId: goodsId });
  res.json({ detail: goods });
});

router.post('/goods', async (req, res) => { //post 용도
    const { goodsId, name, thumbnailUrl, category, price } = req.body;
  
    isExist = await Goods.find({ goodsId });
    if (isExist.length == 0) {
      await Goods.create({ goodsId, name, thumbnailUrl, category, price });
    }
    res.send({ result: "success" });
});

router.post("/goods/:goodsId/cart", async (req, res) => { //장바구니 상품 추가
  const { goodsId } = req.params; //params로 goodsId를 가져옴
  const { quantity } = req.body; //body에 수량만 담아올 것

  isCart = await Cart.find({ goodsId });
  console.log(isCart, quantity);
  if (isCart.length) {
    await Cart.updateOne({ goodsId }, { $set: { quantity } }); //이미 장바구니에 있다면 update(갱신)
  } else {
    await Cart.create({ goodsId: goodsId, quantity: quantity }); //아직 장바구니에 없는 경우 create
  }
  res.send({ result: "success" });
});

router.delete("/goods/:goodsId/cart",async(req, res)=>{ //장바구니 상품 삭제
    const { goodsId } = req.params; //상품 goodsId 를 가져옴

    const isGoodsInCart = await Cart.find({ goodsId }); //해당 장바구니에 이 goodid인 정보가 있는지
    if(isGoodsInCart.length > 0){ //있으면, 지우겠다
        await Cart.deleteOne({ goodsId });
    }

    res.send({ result: "success"});
})

router.patch("/goods/:goodsId/cart", async (req, res) => { //수량변경 api
    const { goodsId } = req.params; //상품Id 받아옴
    const { quantity } = req.body; //수량 가져옴

    const isGoodsInCart = await Cart.find({ goodsId }); //해당상품이 있는지 조회
    if(isGoodsInCart.length > 0){ //상품이 있으면
        await Cart.updateOne({ goodsId }, { $set: { quantity } }); //상품수량을 변경하는 함수 호출
    }

    res.send({ result: "success" });
})

router.get("/cart", async (req, res) => {
    const cart = await Cart.find({}); //Cart의 장바구니 정보를 다 가져옴
    const goodsId = cart.map(cart => cart.goodsId); //goodsId 정보를 가져옴
  
    goodsInCart = await Goods.find() //장바구니에 담겨있는 goodsId 만 가져옴
      .where("goodsId")
      .in(goodsId);
  
    concatCart = cart.map(c => {
      for (let i = 0; i < goodsInCart.length; i++) {
        if (goodsInCart[i].goodsId == c.goodsId) { //장바구니의 goodsId 와 상품조회해서 가져온 goodsId 를 비교
          return { quantity: c.quantity, goods: goodsInCart[i] }; //수량, 상품정보 담아줌
        }
      }
    });
  
    res.json({
      cart: concatCart
    });
  });

module.exports = router;