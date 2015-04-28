namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class LinkedRoutesToUser : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Routes", "UserId", c => c.String(maxLength: 128));
            CreateIndex("dbo.Routes", "UserId");
            AddForeignKey("dbo.Routes", "UserId", "dbo.AspNetUsers", "Id");
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Routes", "UserId", "dbo.AspNetUsers");
            DropIndex("dbo.Routes", new[] { "UserId" });
            DropColumn("dbo.Routes", "UserId");
        }
    }
}
