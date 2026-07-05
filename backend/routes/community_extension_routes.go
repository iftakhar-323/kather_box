package routes

import (
	"katherbox/controllers"
	"katherbox/middleware"

	"github.com/gin-gonic/gin"
)

func CommunityExtensionRoutes(router *gin.Engine) {
	auth := middleware.AuthMiddleware()

	// Follow
	router.POST("/api/community/follow/:user_id", auth, controllers.FollowUser)
	router.DELETE("/api/community/follow/:user_id", auth, controllers.UnfollowUser)
	router.GET("/api/community/followers/:user_id", controllers.ListFollowers)
	router.GET("/api/community/following/:user_id", controllers.ListFollowing)

	// Bookmark
	router.POST("/api/community/bookmark/:post_type/:post_id", auth, controllers.ToggleBookmark)
	router.GET("/api/community/bookmarks", auth, controllers.ListBookmarks)

	// Groups
	router.POST("/api/community/groups", auth, controllers.CreateGroup)
	router.GET("/api/community/groups", controllers.ListGroups)
	router.POST("/api/community/groups/:id/join", auth, controllers.JoinGroup)
	router.DELETE("/api/community/groups/:id/join", auth, controllers.LeaveGroup)
	router.GET("/api/community/groups/:id/members", controllers.ListGroupMembers)

	// Q&A
	router.POST("/api/community/questions", auth, controllers.AskQuestion)
	router.GET("/api/community/questions", controllers.ListQuestions)
	router.GET("/api/community/questions/:id", controllers.GetQuestion)
	router.POST("/api/community/questions/:id/answer", auth, controllers.AnswerQuestion)
	router.PATCH("/api/community/answers/:id/accept", auth, controllers.AcceptAnswer)

	// Leaderboard
	router.GET("/api/community/leaderboard", controllers.Leaderboard)
}