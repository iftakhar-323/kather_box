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
		authGroup.POST("/forgot-password", controllers.ForgotPassword)
		authGroup.POST("/reset-password", controllers.ResetPassword)

		// protected
		authGroup.GET("/me", middleware.AuthMiddleware(), controllers.Me)
		authGroup.POST("/send-verification", middleware.AuthMiddleware(), controllers.SendVerification)
		authGroup.POST("/verify-email", controllers.VerifyEmail)
	}
}
