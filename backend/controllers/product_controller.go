package controllers

import (
	"fmt"
	"net/http"

	"katherbox/database"
	"katherbox/models"

	"github.com/gin-gonic/gin"
)

// GET all products  (?search= &category= &subcategory= &indoor_outdoor= &min_price= &max_price=)
func GetProducts(c *gin.Context) {
	var products []models.Product
	q := database.DB.Model(&models.Product{})

	if s := c.Query("search"); s != "" {
		like := "%" + s + "%"
		q = q.Where("name LIKE ? OR description LIKE ?", like, like)
	}
	if cat := c.Query("category"); cat != "" {
		q = q.Where("category = ?", cat)
	}
	if sub := c.Query("subcategory"); sub != "" {
		q = q.Where("subcategory = ?", sub)
	}
	if io := c.Query("indoor_outdoor"); io != "" {
		q = q.Where("indoor_outdoor = ? OR indoor_outdoor = ?", io, "both")
	}
	if v := c.Query("min_price"); v != "" {
		q = q.Where("price >= ?", v)
	}
	if v := c.Query("max_price"); v != "" {
		q = q.Where("price <= ?", v)
	}

	// sorting
	switch c.Query("sort") {
	case "price_asc":
		q = q.Order("price asc")
	case "price_desc":
		q = q.Order("price desc")
	case "name_asc":
		q = q.Order("name asc")
	case "newest":
		q = q.Order("id desc")
	default:
		q = q.Order("id desc")
	}

	// pagination (defaults: page=1, limit=24, capped at 100)
	page := 1
	limit := 24
	if v := c.Query("page"); v != "" {
		fmt.Sscanf(v, "%d", &page)
	}
	if v := c.Query("limit"); v != "" {
		fmt.Sscanf(v, "%d", &limit)
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 24
	}
	if limit > 100 {
		limit = 100
	}

	var total int64
	q.Model(&models.Product{}).Count(&total)

	q.Limit(limit).Offset((page - 1) * limit).Find(&products)

	c.JSON(http.StatusOK, gin.H{
		"items":      products,
		"page":       page,
		"limit":      limit,
		"total":      total,
		"total_pages": int((total + int64(limit) - 1) / int64(limit)),
	})
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
