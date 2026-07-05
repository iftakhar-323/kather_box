package models

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name           string  `json:"name"`
	Category       string  `json:"category"`     // "plant" or "decor" or "care"
	Subcategory    string  `json:"subcategory"`  // "indoor_plant","outdoor_plant","plant_box","decor","soil","fertilizer","care_kit"
	IndoorOutdoor  string  `json:"indoor_outdoor"` // "indoor", "outdoor", "both", ""
	Price          float64 `json:"price"`
	Stock          uint    `json:"stock"`
	Description    string  `json:"description"`
	ImageURL       string  `json:"image_url"`
}