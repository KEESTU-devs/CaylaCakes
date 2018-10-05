const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  const shoppingCart = [
    {
      name: 'Flake Cookies',
      quantity: 1,
      unitPrice: 4.99
    },
    {
      name: 'Sugar Cookies',
      quantity: 1,
      unitPrice: 2.99
    }
  ]

  let total = 0
  let tax

  shoppingCart.map(item => total = total + item.unitPrice)
  tax = Math.round((total * 0.06) * 100) / 100
  res.render('index', { shoppingCart, tax, total })
})

module.exports = router
