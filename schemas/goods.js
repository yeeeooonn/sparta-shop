const mongoose = require("mongoose");

const { Schema } = mongoose;
const goodsSchema = new Schema({ //상품의 스키마 구성
  goodsId: {
    type: Number,
    required: true, //이 정보가 필수정보인지 아닌지
    unique: true //이 정보가 유니크(겹치지 않아야) 해야되나
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  thumbnailUrl: {
    type: String
  },
  category: {
    type: String
  },
  price: {
    type: Number
  }
});

module.exports = mongoose.model("Goods", goodsSchema);