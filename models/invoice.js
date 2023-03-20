const express = require('express')
const mongoose = require('mongoose')

const invoiceSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },

    accountArray: [
        {
            accountId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account',
                required: true
            },
            amount: {
                type: Number,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    invoiceNumber: {
        type: String,
        required: true
    },

    year: {
        type: String,
        required: true
    }

});
const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice