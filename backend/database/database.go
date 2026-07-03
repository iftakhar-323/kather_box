package database

import (
	"log"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	database, err := gorm.Open(sqlite.Open("katherbox.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}
	DB = database
}