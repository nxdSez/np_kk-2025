const { PrismaClientValidationError } = require("@prisma/client/runtime/library")
const prisma = require("../config/prisma")

exports.changeOrderStatusEmp = async (req, res) => {
  try {
    const { orderId, total, productId } = req.body
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" })
    }

    const data = {}
    if (total !== undefined) data.total = Number(total)
    if (productId !== undefined) data.productId = Number(productId)

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided" })
    }

    const orderUpdate = await prisma.order.update({
      where: { id: Number(orderId) },
      data,
      include: {
        product: true,
        customer: {
          select: { id: true, email: true, address: true }
        }
      }
    })

    console.log("updated order", orderId, data)
    res.json(orderUpdate)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "conAdmin Error" })
  }
}
exports.getOrderEmp = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        product: true,
        customer: {
          select: {
            id: true,
            email: true,
            address: true,
          }
        }
      },
      orderBy: { id: "desc" }
    })
    res.send(orders)
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "conAdmin Error" })
  }
}