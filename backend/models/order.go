package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	UserID     uint        `json:"user_id"`
	TotalPrice float64     `json:"total_price"`
	Status     string      `json:"status"` // Pending, Processing, Packed, On the Way, Delivered
	Items      []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	gorm.Model
	OrderID   uint    `json:"order_id"`
	ProductID uint    `json:"product_id"`
	Product   Product `json:"product" gorm:"foreignKey:ProductID"`
	Quantity  uint    `json:"quantity"`
	Price     float64 `json:"price"` // order kore somoy jei price chilo, seta save thakbe
}
