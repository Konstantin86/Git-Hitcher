namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RouteRecurrency_Added_Right : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.RouteRecurrencies",
                c => new
                    {
                        RouteId = c.Int(nullable: false),
                        Mode = c.Int(nullable: false),
                        Interval = c.Int(nullable: false),
                        Weekdays = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.RouteId)
                .ForeignKey("dbo.Routes", t => t.RouteId)
                .Index(t => t.RouteId);
            
            AddColumn("dbo.Routes", "DueDate", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.RouteRecurrencies", "RouteId", "dbo.Routes");
            DropIndex("dbo.RouteRecurrencies", new[] { "RouteId" });
            DropColumn("dbo.Routes", "DueDate");
            DropTable("dbo.RouteRecurrencies");
        }
    }
}
