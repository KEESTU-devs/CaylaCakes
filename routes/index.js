const express = require('express'), cookieParser = require('cookie-parser')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  let cart = JSON.parse(req.cookies['shopping-cart']) || []

  let total = 0
  let tax

  cart.forEach(item => total = total + parseFloat(item.unitPrice))
  tax = (total * 0.06).toFixed(2)
  total = total.toFixed(2)

  res.render('index', { cart, tax, total })
})

router.post('/clearCart', function (req, res, next) {
  res.cookie('shopping-cart', JSON.stringify([]))
  res.sendStatus(200)
})

router.post('/removeItem', function (req, res, next) {
  let cart = JSON.parse(req.cookies['shopping-cart'])
  cart = cart.filter(item => item.name !== req.body.item)
  res.cookie('shopping-cart', JSON.stringify(cart))
  res.sendStatus(200)
})

router.post('/addToCart', function (req, res, next) {
  try {
    const item = [{ name: req.body.name, quantity: req.body.quantity, unitPrice: req.body.unitPrice }]
    let cart = JSON.parse(req.cookies['shopping-cart']) || []
    cart = [...cart, ...item]
    res.cookie('shopping-cart', JSON.stringify(cart))
    res.sendStatus(200)
  } catch {
    res.sendStatus(500)
  }
})

module.exports = router
