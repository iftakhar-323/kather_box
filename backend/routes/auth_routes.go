package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(router *gin.Engine) {
	authGroup := router.Group("/api/auth")
	{
		authGroup.POST("/register", controllers.Register)
		authGroup.POST("/login", controllers.Login)

		// protected
		authGroup.GET("/me", middleware.AuthMiddleware(), controllers.Me)

		// ===== Sprint A — profile + address book =====
		authGroup.PUT("/profile", middleware.AuthMiddleware(), controllers.UpdateProfile)
		authGroup.PUT("/change-password", middleware.AuthMiddleware(), controllers.ChangePassword)
		authGroup.DELETE("/account", middleware.AuthMiddleware(), controllers.DeleteAccount)

		authGroup.GET("/addresses", middleware.AuthMiddleware(), controllers.ListAddresses)
		authGroup.POST("/addresses", middleware.AuthMiddleware(), controllers.CreateAddress)
		authGroup.PUT("/addresses/:id", middleware.AuthMiddleware(), controllers.UpdateAddress)
		authGroup.DELETE("/addresses/:id", middleware.AuthMiddleware(), controllers.DeleteAddress)
		authGroup.PUT("/addresses/:id/default", middleware.AuthMiddleware(), controllers.SetDefaultAddress)
	}
}
