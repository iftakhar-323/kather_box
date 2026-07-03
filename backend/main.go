package main

import (
	"time"

	"katherbox/database"
	"katherbox/models"
	"katherbox/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.ConnectDatabase()
	database.DB.AutoMigrate(
		&models.Product{},
		&models.User{},
		&models.Cart{},
		&models.CartItem{},
		&models.Order{},
		&models.OrderItem{},
	)

	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5174", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.ProductRoutes(router)
	routes.AuthRoutes(router)
	routes.CartRoutes(router)
	routes.OrderRoutes(router)

	router.Run(":8081")
}
