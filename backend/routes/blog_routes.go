package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func BlogRoutes(router *gin.Engine) {
	auth := middleware.AuthMiddleware()
	admin := middleware.AdminMiddleware()

	// Public reads — note: /api/blog/by-id/:id is checked before /:slug so numeric
	// slugs aren't accidentally treated as IDs.
	router.GET("/api/blog/by-id/:id", auth, admin, controllers.AdminGetBlogPost)
	router.GET("/api/blog", controllers.ListBlogPosts)
	router.GET("/api/blog/:slug", controllers.GetBlogPost)

	// Admin write — :id here is numeric for in-DB updates
	router.POST("/api/blog", auth, admin, controllers.CreateBlogPost)
	router.PATCH("/api/blog/by-id/:id", auth, admin, controllers.UpdateBlogPost)
	router.DELETE("/api/blog/by-id/:id", auth, admin, controllers.DeleteBlogPost)
}