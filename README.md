This is a simple web app for managing personal contacts and their phone numbers.

To run it: 

-create the database
in appsettings.json modify in DefaultConnection the LocalDB server's name if needed  
in Visual Studio's Package Management Console ececute:
EntityFrameworkCore\Update-Database -Project Persistence -StartupProject ContactsManagementAPI

-start the backend (using the https profile)

-start the frontend 
install dependencies: npm install
build and run the app: ng serve --ssl
