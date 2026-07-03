package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func ProductRoutes(router *gin.Engine) {
	productGroup := router.Group("/api/products")
	{
		productGroup.GET("/", controllers.GetProducts)
		productGroup.GET("/:id", controllers.GetProduct)

		productGroup.POST("/", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.CreateProduct)
		productGroup.PUT("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.UpdateProduct)
		productGroup.DELETE("/:id", middleware.AuthMiddleware(), middleware.AdminMiddleware(), controllers.DeleteProduct)
	}
}
