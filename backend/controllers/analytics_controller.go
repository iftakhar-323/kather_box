package controllers

import (
	"net/http"
	"strconv"
	"time"

	"katherbox/database"
	"katherbox/models"

	"github.com/gin-gonic/gin"
)

// ---------- Analytics dashboard ----------

// GET /api/analytics/summary?days=30
// Returns: total_revenue, total_orders, total_customers, avg_order, daily[]
func AnalyticsSummary(c *gin.Context) {
	days := 30
	if d := c.Query("days"); d != "" {
		if n, err := strconv.Atoi(d); err == nil && n > 0 && n <= 365 {
			days = n
		}
	}
	since := time.Now().AddDate(0, 0, -days)

	var totalRevenue float64
	database.DB.Model(&models.Order{}).
		Where("created_at >= ? AND status <> ?", since, "cancelled").
		Select("COALESCE(SUM(total_price),0)").Row().Scan(&totalRevenue)

	var totalOrders int64
	database.DB.Model(&models.Order{}).Where("created_at >= ?", since).Count(&totalOrders)

	var totalCustomers int64
	database.DB.Model(&models.User{}).Where("created_at >= ?", since).Count(&totalCustomers)

	var avg float64
	if totalOrders > 0 {
		avg = totalRevenue / float64(totalOrders)
	}

	// daily revenue buckets
	type bucket struct {
		Date  string  `json:"date"`
		Total float64 `json:"total"`
		Count int     `json:"count"`
	}
	rows, err := database.DB.Raw(`
		SELECT strftime('%Y-%m-%d', created_at) as date,
		       COALESCE(SUM(total_price),0) as total,
		       COUNT(*) as count
		FROM orders
		WHERE created_at >= ? AND status <> 'cancelled'
		GROUP BY date ORDER BY date ASC
	`, since).Rows()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	daily := make([]bucket, 0, days)
	for rows.Next() {
		var b bucket
		if err := rows.Scan(&b.Date, &b.Total, &b.Count); err == nil {
			daily = append(daily, b)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"days":            days,
		"total_revenue":   totalRevenue,
		"total_orders":    totalOrders,
		"total_customers": totalCustomers,
		"avg_order":       avg,
		"daily":           daily,
	})
}

// GET /api/analytics/top-customers?limit=10
func TopCustomers(c *gin.Context) {
	limit := 10
	if l := c.Query("limit"); l != "" {
		if n, err := strconv.Atoi(l); err == nil && n > 0 && n <= 50 {
			limit = n
		}
	}
	type row struct {
		UserID       uint    `json:"user_id"`
		Name         string  `json:"name"`
		Email        string  `json:"email"`
		OrderCount   int     `json:"order_count"`
		TotalSpend   float64 `json:"total_spend"`
	}
	var rows []row
	database.DB.Raw(`
		SELECT u.id as user_id, COALESCE(u.name,'') as name, u.email as email,
		       COUNT(o.id) as order_count,
		       COALESCE(SUM(o.total_price),0) as total_spend
		FROM users u
		JOIN orders o ON o.user_id = u.id
		WHERE o.status <> 'cancelled'
		GROUP BY u.id
		ORDER BY total_spend DESC
		LIMIT ?`, limit).Scan(&rows)
	if rows == nil {
		rows = []row{}
	}
	c.JSON(http.StatusOK, rows)
}

// GET /api/analytics/inventory  (low-stock report)
func InventoryReport(c *gin.Context) {
	threshold := 5
	if t := c.Query("threshold"); t != "" {
		if n, err := strconv.Atoi(t); err == nil && n >= 0 {
			threshold = n
		}
	}
	var ps []models.Product
	database.DB.Where("stock <= ?", threshold).Order("stock asc").Find(&ps)
	if ps == nil {
		ps = []models.Product{}
	}
	c.JSON(http.StatusOK, gin.H{"threshold": threshold, "low_stock": ps})
}

// GET /api/analytics/traffic?days=30
func TrafficReport(c *gin.Context) {
	days := 30
	if d := c.Query("days"); d != "" {
		if n, err := strconv.Atoi(d); err == nil && n > 0 && n <= 365 {
			days = n
		}
	}
	since := time.Now().AddDate(0, 0, -days)
	type row struct {
		Date  string `json:"date"`
		Views int    `json:"views"`
	}
	var rows []row
	database.DB.Raw(`
		SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(*) as views
		FROM page_views WHERE created_at >= ? GROUP BY date ORDER BY date ASC`, since).
		Scan(&rows)
	if rows == nil {
		rows = []row{}
	}
	c.JSON(http.StatusOK, gin.H{"days": days, "traffic": rows})
}

// GET /api/analytics/categories  (revenue by category)
func CategoryRevenue(c *gin.Context) {
	type row struct {
		Category string  `json:"category"`
		Revenue  float64 `json:"revenue"`
		Count    int     `json:"count"`
	}
	var rows []row
	database.DB.Raw(`
		SELECT COALESCE(p.category,'Uncategorized') as category,
		       COALESCE(SUM(oi.price * oi.quantity),0) as revenue,
		       COUNT(oi.id) as count
		FROM order_items oi
		JOIN products p ON p.id = oi.product_id
		GROUP BY p.category
		ORDER BY revenue DESC`).Scan(&rows)
	if rows == nil {
		rows = []row{}
	}
	c.JSON(http.StatusOK, rows)
}
