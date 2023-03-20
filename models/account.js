const express = require('express');
const mongoose = require('mongoose');


const accountSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    balances: [
        {
            year: {
                type: String,
                required: true
            },
            
            balance: {
                type: Number,
                required: true
            }
        }
    ]
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account