package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name         string `json:"name"`
	Email        string `json:"email" gorm:"unique"`
	Password     string `json:"-"`
	Role         string `json:"role" gorm:"default:customer"` // "customer" or "admin"
	Points       uint   `json:"points" gorm:"default:0"`       // Green Points loyalty balance
	EmailVerified bool   `json:"email_verified" gorm:"default:false"`
}
