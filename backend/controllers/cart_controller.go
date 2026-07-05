package controllers

import (
	"net/http"

	"katherbox/database"
	"katherbox/models"

	"github.com/gin-gonic/gin"
)

// User-er cart ta khuje ber kore, na thakle notun banay
func getOrCreateCart(userID uint) models.Cart {
	var cart models.Cart
	result := database.DB.Preload("Items.Product").Where("user_id = ?", userID).First(&cart)

	if result.Error != nil {
		// cart nai, notun banao
		cart = models.Cart{UserID: userID}
		database.DB.Create(&cart)
	}
	return cart
}

// GET /api/cart - user-er nijer cart dekhbe
func GetCart(c *gin.Context) {
	userID := c.GetUint("user_id")
	cart := getOrCreateCart(userID)
	c.JSON(http.StatusOK, cart)
}

type AddToCartInput struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  uint `json:"quantity" binding:"required"`
}

// POST /api/cart/add - product cart e add kora
func AddToCart(c *gin.Context) {
	userID := c.GetUint("user_id")

	var input AddToCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// product ache kina check
	var product models.Product
	if err := database.DB.First(&product, input.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	cart := getOrCreateCart(userID)

	// check koro ei product ta age theke cart e koto quantity te ache
	var existingItem models.CartItem
	err := database.DB.Where("cart_id = ? AND product_id = ?", cart.ID, input.ProductID).First(&existingItem).Error

	totalRequested := input.Quantity
	if err == nil {
		totalRequested += existingItem.Quantity
	}

	// stock enough ache kina check (cart e je ase, oita minus kore dekhbo)
	available := product.Stock
	if err == nil {
		available = product.Stock + existingItem.Quantity
	}

	if totalRequested > available {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Not enough stock",
			"available": available,
		})
		return
	}

	if err == nil {
		// age theke ache, quantity barao
		existingItem.Quantity = totalRequested
		database.DB.Save(&existingItem)
	} else {
		// notun item hisebe add koro
		newItem := models.CartItem{
			CartID:    cart.ID,
			ProductID: input.ProductID,
			Quantity:  input.Quantity,
		}
		database.DB.Create(&newItem)
	}

	// stock theke quantity komiye dao (reservation)
	product.Stock -= input.Quantity
	database.DB.Save(&product)

	updatedCart := getOrCreateCart(userID)
	c.JSON(http.StatusOK, updatedCart)
}

type UpdateCartItemInput struct {
	Quantity uint `json:"quantity" binding:"required"`
}

// PUT /api/cart/item/:id - quantity update kora
func UpdateCartItem(c *gin.Context) {
	itemID := c.Param("id")

	var input UpdateCartItemInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var item models.CartItem
	if err := database.DB.First(&item, itemID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	var product models.Product
	if err := database.DB.First(&product, item.ProductID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// notun quantity te koto stock lagbe, ar product er kase koto free ase (current cart qty bad diye)
	needed := input.Quantity
	available := product.Stock + item.Quantity // item je ta reserve kore ase, oita abar add kore dekhbo

	if needed > available {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Not enough stock",
			"available": available,
		})
		return
	}

	// stock e delta apply koro
	delta := int(needed) - int(item.Quantity)
	if delta != 0 {
		product.Stock = uint(int(product.Stock) - delta)
		database.DB.Save(&product)
	}

	item.Quantity = input.Quantity
	database.DB.Save(&item)

	c.JSON(http.StatusOK, item)
}

// DELETE /api/cart/item/:id - cart theke item remove kora
func RemoveCartItem(c *gin.Context) {
	itemID := c.Param("id")

	var item models.CartItem
	if err := database.DB.First(&item, itemID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	// reserved stock abar product e ferot dao
	var product models.Product
	if err := database.DB.First(&product, item.ProductID).Error; err == nil {
		product.Stock += item.Quantity
		database.DB.Save(&product)
	}

	database.DB.Delete(&item)
	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}
