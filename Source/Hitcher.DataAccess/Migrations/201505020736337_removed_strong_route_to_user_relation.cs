namespace Hitcher.DataAccess.Migrations
{
  using System;
  using System.Data.Entity.Migrations;

  public partial class removed_strong_route_to_user_relation : DbMigration
  {
    public override void Up()
    {
      DropForeignKey("dbo.Routes", "AppUser_Id", "dbo.AspNetUsers");
      DropColumn("dbo.Routes", "AppUser_Id");
      DropForeignKey("dbo.Routes", "UserId", "dbo.AspNetUsers");
      DropIndex("dbo.Routes", new[] { "UserId" });
      AlterColumn("dbo.Routes", "UserId", c => c.String());
    }

    public override void Down()
    {
      AlterColumn("dbo.Routes", "UserId", c => c.String(maxLength: 128));
      CreateIndex("dbo.Routes", "UserId");
      AddForeignKey("dbo.Routes", "UserId", "dbo.AspNetUsers", "Id");
    }
  }
}
