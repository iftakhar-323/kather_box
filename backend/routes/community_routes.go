package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func CommunityRoutes(router *gin.Engine) {
	g := router.Group("/api/community")
	g.Use(middleware.AuthMiddleware())
	{
		g.GET("/posts", controllers.ListPosts)
		g.POST("/posts", controllers.CreatePost)
		g.GET("/posts/:id/comments", controllers.ListComments)
		g.POST("/posts/:id/comments", controllers.AddComment)
		g.POST("/posts/:id/like", controllers.ToggleLike)
		g.DELETE("/posts/:id", controllers.DeletePost)
	}
}