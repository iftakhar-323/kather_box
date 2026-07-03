package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func OrderRoutes(router *gin.Engine) {
	orderGroup := router.Group("/api/orders")
	orderGroup.Use(middleware.AuthMiddleware())
	{
		orderGroup.POST("/checkout", controllers.Checkout)
		orderGroup.GET("/", controllers.GetMyOrders)
		orderGroup.GET("/:id", controllers.GetOrder)
		orderGroup.PUT("/:id/status", middleware.AdminMiddleware(), controllers.UpdateOrderStatus)
	}
}
