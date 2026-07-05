package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

// OrderRoutes mounts order-related endpoints.
func OrderRoutes(router *gin.Engine) {
	userGroup := router.Group("/api/orders")
	userGroup.Use(middleware.AuthMiddleware())
	{
		userGroup.POST("/checkout", controllers.Checkout)
		userGroup.GET("/", controllers.GetMyOrders)
		userGroup.GET("/:id", controllers.GetOrder)
	}
}
