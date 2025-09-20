const prisma = require("../config/prisma")

exports.listUsers = async (req, res) => {
  try {
    //code
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enable: true,
        address: true
      }
    })
    res.json(users);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "listUsers Error" })
  }
}

exports.changeStatus = async (req, res) => {
  try {
    //code
    const { id, enable } = req.body
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { enable: enable }
    })

    res.send('Status has been updated')
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "changeStatus Error" })
  }
}

exports.changeRole = async (req, res) => {
  try {
    //code
    const { id, role } = req.body

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { role: role }
    })

    res.send('Role has been updated')
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "changeRole Error" })
  }
}

exports.userCart = async (req, res) => {
  try {
    //code
    const { cart } = req.body
    console.log(cart)
    console.log(req.user.id)

    const user = await prisma.user.findFirst({
      where: { id: Number(req.user.id) }
    })
    // console.log(user)

    // Check Quantity
    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { quantity: true, title: true }
      })
      // console.log(item)
      // console.log(product)
      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          ok: false,
          message: `สินค้า ${product?.title || 'product'} ไม่เพียงพอ`
        })
      }
    }

    // Delete old Cart Item
    await prisma.productCart.deleteMany({
      where: {
        cart: {
          customerId: user.id
        }
      }
    })

    // Delete old Cart 
    await prisma.cart.deleteMany({
      where: {
        customerId: user.id
      }
    })

    // เตรียมสินค้า
    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price
    }))


    // หาผลรวม
    let cartTotal = products.reduce((sum, item) => sum + item.price * item.count, 0)


    // New cart
    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products
        },
        cartTotal: cartTotal,
        customerId: user.id
      }
    })

    console.log(newCart)

    res.send('Add to Cart')
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "userCart Error" })
  }
}

exports.getUserCart = async (req, res) => {
  try {
    //code
    const cart = await prisma.cart.findFirst({
      where: {
        customerId: Number(req.user.id)
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    res.json({
      products: cart.products,
      carTotal: cart.carTotal
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "getUserCart Error" })
  }
}

exports.emptyCart = async (req, res) => {
  try {
    //code
    const cart = await prisma.cart.findFirst({
      where: {
        customerId: Number(req.user.id)
      }
    })

    if (!cart) {
      return res.status(400).json({ message: 'No Cart' })
    }

    await prisma.productCart.deleteMany({
      where: { cartId: cart.id }
    })

    const result = await prisma.cart.deleteMany({
      where: {
        customerId: Number(req.user.id)
      }
    })


    console.log(cart)
    res.json({
      message: 'Cart Empty Success',
      deletedCount: result.count
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "emptyCart Error" })
  }
}

exports.saveAddress = async (req, res) => {
  try {
    //code
    const { address } = req.body
    console.log(address)
    const addressUser = await prisma.user.update({
      where: {
        id: Number(req.user.id)
      },
      data: {
        address: address
      }
    })

    res.json({ ok: true, message: 'Address Update Success' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "saveAddess Error" })
  }
}

exports.saveOrder = async (req, res) => {
  try {
    //code
    // return res.send('Hello')
    // Get user cart

    const { id, amount, status, currency } = req.body.paymentIntent
    const userCart = await prisma.cart.findFirst({
      where: {
        customerId: Number(req.user.id)
      },
      include: { products: true }
    })

    // Check Empty
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: false, message: 'Cart is Empty' })
    }

    const amountTHB = Number(amount) / 100
    // Create a New Order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price
          }))
        },
        orderedBy: {
          connect: { id: req.user.id }
        },
        cartTotal: userCart.cartTotal,
        stripePaymentId: id,
        amount: Number(amountTHB),
        status: status,
      }
    })

    // Update Product
    const update = userCart.products.map((item) => ({
      where: { id: item.productId },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count }
      }
    }))


    console.log(update)


    await Promise.all(
      update.map((updated) => prisma.product.update(updated))
    )

    await prisma.cart.deleteMany({
      where: {
        customerId: Number(req.user.id)
      }
    })

    res.json({ ok: true, order })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "saveOrder Error" })
  }
}

exports.getOrder = async (req, res) => {
  try {
    //code
    const orders = await prisma.order.findMany({
      where: {
        customerId: Number(req.user.id)
      },
      include: {
        products: {
          include: {
            product: true
          }
        }
      }
    })

    if (!orders.length === 0) {
      return res.status(400).json({ ok: false , message: 'No Orders'})
    }
    res.json({ ok: true, orders })
    console.log(orders)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "getOrder Error" })
  }
}