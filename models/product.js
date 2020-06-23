const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProductSchema = new Schema({

    title: {
        type: String,
        required: true
    }
    , details: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});
mongoose.model("products", ProductSchema);