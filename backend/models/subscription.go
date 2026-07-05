package models

import "gorm.io/gorm"

type Subscription struct {
	gorm.Model
	UserID        uint   `json:"user_id" gorm:"index"`
	PlanName      string `json:"plan_name"`        // "Monthly Plant Box", "Cactus Box", etc.
	IntervalDays  int    `json:"interval_days"`    // 30, 60, 90
	NextDelivery  string `json:"next_delivery"`    // YYYY-MM-DD
	Status        string `json:"status"`           // "active" | "paused" | "cancelled"
	Price         float64 `json:"price"`           // ৳ per delivery
}