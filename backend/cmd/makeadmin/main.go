package main
import (
"fmt"
"katherbox/database"
"katherbox/models"
"katherbox/utils"
)
func main() {
database.ConnectDatabase()
h, _ := utils.HashPassword("Admin@12345")
var u models.User
err := database.DB.Where("email = ?", "admin@katherbox.com").First(&u).Error
if err != nil {
u = models.User{Name: "Site Admin", Email: "admin@katherbox.com", Password: h, Role: "admin"}
database.DB.Create(&u)
fmt.Println("CREATED admin@katherbox.com")
} else {
database.DB.Model(&u).Updates(map[string]interface{}{"password": h, "role": "admin"})
fmt.Println("UPDATED admin@katherbox.com")
}
}
