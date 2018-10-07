const express = require('express')
const router = express.Router()

function generateCartHtml (cart) {
  let response = ''
  cart.forEach(item => {
    response = response +
      `<div class="shopping_cart__item">
        <span class="item__name"> ${item.quantity}x ${item.name}</span> 
        <span class="item__unit_price"> $${item.unitPrice * item.quantity}</span>
        <span id="removeItem" class="shopping_cart__item_remove" onClick="removeItem('${item.name}')"> &times;</span>
       </div>`
  })
  return response
}

function generateTotals (cart) {
  let total = 0
  let tax

  cart.forEach(item => total = total + parseFloat(item.unitPrice))
  tax = (total * 0.06).toFixed(2)
  total = total.toFixed(2)

   return `<div class="row">
      <small>6% tax</small> 
      <span> $${tax}</span>
      <div class="row">
         <hr>
         <div class="row">
           <p>Order Total: $${total}</p>
         </div>
      </div>
    </div>`
}

function rootAction (req, res) {
  try {
    let cart = JSON.parse(req.cookies['shopping-cart']) || []

    let total = 0
    let tax

    cart.forEach(item => total = total + parseFloat(item.unitPrice))
    tax = (total * 0.06).toFixed(2)
    total = total.toFixed(2)

    res.render('index', { cart, tax, total })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

function emptyCart (req, res) {
  try {
    const cart = []
    res.cookie('shopping-cart', JSON.stringify(cart))
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

function removeItem (req, res) {
  try {
    let cart = JSON.parse(req.cookies['shopping-cart'])
    cart = cart.filter(item => item.name !== req.body.item)
    res.cookie('shopping-cart', JSON.stringify(cart))
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

function addToCart (req, res) {
  try {
    const item = [{ name: req.body.name, quantity: req.body.quantity, unitPrice: req.body.unitPrice }]
    let cart = JSON.parse(req.cookies['shopping-cart']) || []
    cart = [...cart, ...item]
    res.cookie('shopping-cart', JSON.stringify(cart))
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
}

router.post('/addToCart', addToCart)
router.post('/clearCart', emptyCart)
router.post('/removeItem', removeItem)
router.get('/', rootAction)

module.exports = router
