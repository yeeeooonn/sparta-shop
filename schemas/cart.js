const mongoose = require("mongoose");

const { Schema } = mongoose;
const cartSchema = new Schema({
    goodsId: { //상품id
        type: Number,
        required: true,
        unique: true
    },
    quantity: { //갯수
        type: Number,
        required: true
    }

});

module.exports = mongoose.model("Cart", cartSchema);