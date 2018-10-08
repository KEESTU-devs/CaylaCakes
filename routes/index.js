const express = require('express')
const router = express.Router()

const ua = require('universal-analytics')
const visitor = ua(process.env.GOOGLE_ANALYTICS_ID, { http: true })

function trackEvent (page, title) {
  try {
    visitor.pageview(page, 'caylacakes.com', title).send()
  } catch (error) {
    console.log('Google Analytics Error: ', error)
  }
}

function trackError (page, title) {
  try {
    const visitor = ua(process.env.GOOGLE_ANALYTICS_ID, { http: true })
    visitor.exception(page, 'caylacakes.com', title).send()
  } catch (error) {
    console.log('Google Analytics Error: ', error)
  }
}

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
    let cart = req.cookies['shopping-cart'] ? JSON.parse(req.cookies['shopping-cart']) : []

    let total = 0
    let tax

    cart.forEach(item => total = total + parseFloat(item.unitPrice))
    tax = (total * 0.06).toFixed(2)
    total = total.toFixed(2)

    trackEvent('/', 'index')
    res.render('index', { cart, tax, total })
  } catch (error) {
    console.log(error)
    trackError('/', 'index')
    res.sendStatus(500)
  }
}

function emptyCart (req, res) {
  try {
    const cart = []
    res.cookie('shopping-cart', JSON.stringify(cart))
    trackEvent('/clearCart', 'empty-cart')
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    trackError('/clearCart', 'empty-cart')
    res.sendStatus(500)
  }
}

function removeItem (req, res) {
  try {
    let cart = JSON.parse(req.cookies['shopping-cart'])
    cart = cart.filter(item => item.name !== req.body.item)
    res.cookie('shopping-cart', JSON.stringify(cart))
    trackEvent('/removeItem', 'remove-item')
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    trackError('/removeItem', 'remove-item')
    res.sendStatus(500)
  }
}

function addToCart (req, res) {
  try {
    const item = [{ name: req.body.name, quantity: req.body.quantity, unitPrice: req.body.unitPrice }]
    let cart = req.cookies['shopping-cart'] ? JSON.parse(req.cookies['shopping-cart']) : []
    cart = [...cart, ...item]
    res.cookie('shopping-cart', JSON.stringify(cart))
    trackEvent('/addToCart', 'add-to-cart')
    res.status(200).send({ cart: generateCartHtml(cart), totals: generateTotals(cart) })
  } catch (error) {
    console.log(error)
    trackError('/addToCart', 'add-to-cart')
    res.sendStatus(500)
  }
}

router.post('/addToCart', addToCart)
router.post('/clearCart', emptyCart)
router.post('/removeItem', removeItem)
router.get('/', rootAction)

module.exports = router
