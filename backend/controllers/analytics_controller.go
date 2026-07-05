package controllers

import (
	"net/http"

	"katherbox/database"
	"katherbox/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /api/admin/analytics
// Returns aggregate stats for the admin dashboard:
//   - revenue (sum of all order totals)
//   - total_orders
//   - total_users, total_products, total_reminders
//   - top_products (top 5 by quantity sold, descending)
//   - orders_by_status (counts grouped by status)
func Analytics(c *gin.Context) {
	var stats struct {
		Revenue        float64                `json:"revenue"`
		TotalOrders    int64                  `json:"total_orders"`
		TotalUsers     int64                  `json:"total_users"`
		TotalProducts  int64                  `json:"total_products"`
		TotalReminders int64                  `json:"total_reminders"`
		OrdersByStatus []StatusCount          `json:"orders_by_status"`
		TopProducts    []TopProduct           `json:"top_products"`
	}

	// Revenue + order count
	database.DB.Model(&models.Order{}).
		Select("COALESCE(SUM(total_price),0)").
		Scan(&stats.Revenue)
	database.DB.Model(&models.Order{}).Count(&stats.TotalOrders)

	// User / product / reminder counts
	database.DB.Model(&models.User{}).Count(&stats.TotalUsers)
	database.DB.Model(&models.Product{}).Count(&stats.TotalProducts)
	database.DB.Model(&models.CareReminder{}).Where("completed = ?", false).Count(&stats.TotalReminders)

	// Orders by status
	type statusRow struct {
		Status string
		Count  int64
	}
	var rows []statusRow
	database.DB.Model(&models.Order{}).
		Select("status, COUNT(*) as count").
		Group("status").Scan(&rows)
	for _, r := range rows {
		stats.OrdersByStatus = append(stats.OrdersByStatus, StatusCount{Status: r.Status, Count: r.Count})
	}

	// Top 5 products by quantity sold (sum across OrderItems)
	type topRow struct {
		ProductID uint
		Name      string
		Sold      int64
		Revenue   float64
	}
	var top []topRow
	database.DB.Table("order_items").
		Select("order_items.product_id, products.name, SUM(order_items.quantity) as sold, SUM(order_items.quantity * order_items.price) as revenue").
		Joins("JOIN products ON products.id = order_items.product_id").
		Group("order_items.product_id, products.name").
		Order("sold DESC").Limit(5).Scan(&top)
	for _, t := range top {
		stats.TopProducts = append(stats.TopProducts, TopProduct{
			ProductID: t.ProductID,
			Name:      t.Name,
			Sold:      t.Sold,
			Revenue:   t.Revenue,
		})
	}

	c.JSON(http.StatusOK, stats)

	// silence unused gorm import if any caller does not need it
	_ = gorm.ErrInvalidDB
}

type StatusCount struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type TopProduct struct {
	ProductID uint    `json:"product_id"`
	Name      string  `json:"name"`
	Sold      int64   `json:"sold"`
	Revenue   float64 `json:"revenue"`
}
