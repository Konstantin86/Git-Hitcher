namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class fixedRoutestoUsersRelations : DbMigration
    {
        public override void Up()
        {
            DropForeignKey("dbo.Routes", "UserId", "dbo.AspNetUsers");
            DropIndex("dbo.Routes", new[] { "UserId" });
            AddColumn("dbo.Routes", "AppUser_Id", c => c.String(maxLength: 128));
            AlterColumn("dbo.Routes", "UserId", c => c.String());
            CreateIndex("dbo.Routes", "AppUser_Id");
            AddForeignKey("dbo.Routes", "AppUser_Id", "dbo.AspNetUsers", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Routes", "AppUser_Id", "dbo.AspNetUsers");
            DropIndex("dbo.Routes", new[] { "AppUser_Id" });
            AlterColumn("dbo.Routes", "UserId", c => c.String(maxLength: 128));
            DropColumn("dbo.Routes", "AppUser_Id");
            CreateIndex("dbo.Routes", "UserId");
            AddForeignKey("dbo.Routes", "UserId", "dbo.AspNetUsers", "Id");
        }
    }
}
