const Account = require('../models/account')
const Invoice = require('../models/invoice')
const MongoClient = require('mongodb').MongoClient;

async function handleAccountCreation(req, res) {
    try {
        const account = new Account({
          name: req.body.name,
          balances: req.body.balances
        });
    
        await account.save();
        res.status(200).json({ message: 'Account created successfully.' });
    }
    
    catch (error) {
        res.status(500).json({ message: error.message });
      }
}

async function handleAccountInvoice(req, res) {
  
    try {
        if (!req.body.date || !req.body.customerId || !req.body.accountArray || !req.body.totalAmount || !req.body.invoiceNumber || !req.body.year) {
          return res.status(400).json({ message: 'All fields are compulsory.' });
        }
    
        if (req.body.accountArray.length < 1) {
          return res.status(400).json({ message: 'Account array should have at least one object.' });
        }
    
        const accountArrayTotal = req.body.accountArray.reduce((accumulator, currentValue) => accumulator + currentValue.amount, 0);
        if (accountArrayTotal !== req.body.totalAmount) {
          return res.status(400).json({ message: 'Total of amount in AccountArray should be equal to Total Amount.' });
        }
    
        const accountIds = req.body.accountArray.map(account => account.accountId);
        const accounts = await Account.find({ _id: { $in: accountIds } });
        if (accounts.length == 0) {
          return res.status(400).json({ message: 'All accountId should be present in DB.' });
        }
        
        const existingInvoice = await Invoice.findOne({ invoiceNumber: req.body.invoiceNumber, year: req.body.year });
        if (existingInvoice) {
          return res.status(400).json({ message: 'Same invoice number already present for the same year.' });
        }
    
        const invoice = new Invoice({
          date: req.body.date,
          customerId: req.body.customerId,
          accountArray: req.body.accountArray,
          totalAmount: req.body.totalAmount,
          invoiceNumber: req.body.invoiceNumber,
          year: req.body.year
        });
        
        await invoice.save();
        
        const year = req.body.year;
        for (const account of accounts) {
          const balanceIndex = account.balances.findIndex(balance => balance.year === year);
          if (balanceIndex === -1) {
            account.balances.push({ year: year, balance: req.body.accountArray.find(accountArray => accountArray.accountId === account._id.toString()).amount });
          } else {
            account.balances[balanceIndex].balance += req.body.accountArray.find(accountArray => accountArray.accountId === account._id.toString()).amount;
          }
          await account.save();
        }
        
        res.status(200).json({ message: 'Invoice created successfully.' });
      } catch (error) {
        res.status(500).json({ message: error.message });
        }
}

async function handleListInvoice(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        const searchText = req.query.searchText || '';
        console.log(skip,limit,searchText)
        const searchRegex = new RegExp(searchText, 'i');
    
        const client = new MongoClient("mongodb://127.0.0.1:27017/invoice_api", { useNewUrlParser: true });
        await client.connect();
    
        const db = client.db('invoice_api');
        const invoicesCollection = db.collection('invoices');
        console.log(invoicesCollection)
        const invoicesCursor = invoicesCollection.find({
          $or: [
            { invoiceNumber: searchRegex },
            { 'accountArray.accountId': searchRegex },
            { 'accountArray.amount': searchRegex }
          ]
        });
    
        const filteredInvoicesCursor = invoicesCursor.skip(skip).limit(limit);
        const invoices = await filteredInvoicesCursor.toArray();
    
        res.send(invoices);
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
      }
}

module.exports = {
    handleAccountCreation,
    handleAccountInvoice,
    handleListInvoice
}