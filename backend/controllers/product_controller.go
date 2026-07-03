package controllers

import (
	"net/http"

	"katherbox/database"
	"katherbox/models"

	"github.com/gin-gonic/gin"
)

// GET all products
func GetProducts(c *gin.Context) {
	var products []models.Product
	database.DB.Find(&products)
	c.JSON(http.StatusOK, products)
}

// GET single product
func GetProduct(c *gin.Context) {
	var product models.Product
	id := c.Param("id")
	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	c.JSON(http.StatusOK, product)
}

// POST create product
func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Create(&product)
	c.JSON(http.StatusCreated, product)
}

// PUT update product
func UpdateProduct(c *gin.Context) {
	var product models.Product
	id := c.Param("id")
	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	database.DB.Save(&product)
	c.JSON(http.StatusOK, product)
}

// DELETE product
func DeleteProduct(c *gin.Context) {
	var product models.Product
	id := c.Param("id")
	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}
	database.DB.Delete(&product)
	c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
}
