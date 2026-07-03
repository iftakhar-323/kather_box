package controllers

import (
	"net/http"

	"katherbox/database"
	"katherbox/models"

	"github.com/gin-gonic/gin"
)

// POST /api/orders/checkout - cart theke order banabe
func Checkout(c *gin.Context) {
	userID := c.GetUint("user_id")

	// user-er cart ber koro, items soho
	var cart models.Cart
	if err := database.DB.Preload("Items.Product").Where("user_id = ?", userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart not found"})
		return
	}

	if len(cart.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	// total price calculate koro ar order items banao
	var totalPrice float64
	var orderItems []models.OrderItem

	for _, item := range cart.Items {
		itemTotal := item.Product.Price * float64(item.Quantity)
		totalPrice += itemTotal

		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price, // ei somoyer price snapshot hisebe save
		})
	}

	order := models.Order{
		UserID:     userID,
		TotalPrice: totalPrice,
		Status:     "Pending",
		Items:      orderItems,
	}

	database.DB.Create(&order)

	// cart khali kore dao (checkout er por cart clear howa uchit)
	database.DB.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{})

	// notun order ta full detail soho fetch kore pathao
	database.DB.Preload("Items.Product").First(&order, order.ID)

	c.JSON(http.StatusCreated, order)
}

// GET /api/orders - user-er nijer shob order dekhbe
func GetMyOrders(c *gin.Context) {
	userID := c.GetUint("user_id")

	var orders []models.Order
	database.DB.Preload("Items.Product").Where("user_id = ?", userID).Order("created_at desc").Find(&orders)

	c.JSON(http.StatusOK, orders)
}

// GET /api/orders/:id - single order details
func GetOrder(c *gin.Context) {
	userID := c.GetUint("user_id")
	orderID := c.Param("id")

	var order models.Order
	if err := database.DB.Preload("Items.Product").Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, order)
}

type UpdateStatusInput struct {
	Status string `json:"status" binding:"required"`
}

// PUT /api/orders/:id/status - admin order status update korbe
func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")

	var input UpdateStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var order models.Order
	if err := database.DB.First(&order, orderID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	order.Status = input.Status
	database.DB.Save(&order)

	c.JSON(http.StatusOK, order)
}
