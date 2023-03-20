const express = require('express')
const router = express.Router()
const {handleAccountCreation,handleAccountInvoice, handleListInvoice} = require('../controllers/controller')

router.post('/createaccount', handleAccountCreation)
router.post('/createinvoice', handleAccountInvoice)
router.get('/invoicelist', handleListInvoice)

module.exports = router