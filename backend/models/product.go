package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name        string  `json:"name"`
	Category    string  `json:"category"` // "plant" or "decor"
	Price       float64 `json:"price"`
	Stock       uint    `json:"stock"`
	Description string  `json:"description"`
	ImageURL    string  `json:"image_url"`
}