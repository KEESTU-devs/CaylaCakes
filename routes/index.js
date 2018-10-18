const express = require('express')
const router = express.Router()

const { visitor } = require('../app')

function trackEvent (page, title, req) {
  try {
    visitor.set("uid", req.ip)
    visitor.event(page, title, req.ip).send()
  } catch (error) {
    console.log('Google Analytics Error: ', error)
  }
}

function trackError (page, title, req) {
  try {
    visitor.set("uid", req.ip)
    visitor.exception(page, 'caylacakes.com', title).send()
  } catch (error) {
    console.log('Google Analytics Error: ', error)
  }
}

function generateCartHtml (cart) {
  let id = 0
  let response = ''
  cart.forEach(item => {
    id++
    response = response +
      `<div id="${item.id}" class="shopping_cart__item">
        <span class="item__name"> ${item.quantity}x ${item.name}</span> 
        <span class="item__unit_price"> $${item.unitPrice * item.quantity}</span>
        <span id="removeItem" class="shopping_cart__item_remove" onClick="removeItem('${item.id}')"> &times;</span>
       </div>`
  })
  return response
}

function generateTotals (cart) {
  let total = 0
  let tax

  cart.forEach(item => total = total + parseFloat(item.unitPrice))
  tax = (total * 0.06).toFixed(2)
  total = (parseFloat(total) + parseFloat(tax)).toFixed(2)

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
    let cart = req.cookies['shopping-cart'] ? JSON.parse(req.cookies['shopping-cart']) : []

    let total = 0
    let tax

    cart.forEach(item => total = total + parseFloat(item.unitPrice))
    tax = (total * 0.06).toFixed(2)
    total = (parseFloat(total) + parseFloat(tax)).toFixed(2)

    trackEvent('/', 'index', req)
    res.render('index', { cart, tax, total })
  } catch (error) {
    console.log(error)
    trackError('/', 'index', req)
    res.sendStatus(500)
  }
}

function emptyCart (req, res) {
  try {
    const cart = []
    res.cookie('shopping-cart', JSON.stringify(cart))

    trackEvent('/clearCart', 'empty-cart', req)
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    trackError('/clearCart', 'empty-cart', req)
    res.sendStatus(500)
  }
}

function removeItem (req, res) {
  try {
    let cart = JSON.parse(req.cookies['shopping-cart'])
    console.log('remove item', req.body.item)
    cart = cart.filter(item => item.id !== req.body.item)

    res.cookie('shopping-cart', JSON.stringify(cart))
    trackEvent('/removeItem', 'remove-item', req)
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    trackError('/removeItem', 'remove-item', req)
    res.sendStatus(500)
  }
}

function addToCart (req, res) {
  try {
    const item = [{ id: uuidv4(), name: req.body.name, quantity: req.body.quantity, unitPrice: req.body.unitPrice }]
    let cart = req.cookies['shopping-cart'] ? JSON.parse(req.cookies['shopping-cart']) : []
    cart = [...cart, ...item]
    res.cookie('shopping-cart', JSON.stringify(cart))
    trackEvent('/addToCart', 'add-to-cart', req)
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    trackError('/addToCart', 'add-to-cart', req)
    res.sendStatus(500)
  }
}

function uuidv4 () {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

router.post('/addToCart', addToCart)
router.post('/clearCart', emptyCart)
router.post('/removeItem', removeItem)
router.get('/', rootAction)

module.exports = router
