namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Coord_Added : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Coords",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        Lat = c.Single(nullable: false),
                        Lng = c.Single(nullable: false),
                        RouteId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.Id)
                .ForeignKey("dbo.Routes", t => t.RouteId, cascadeDelete: true)
                .Index(t => t.RouteId);
            
            AddColumn("dbo.Routes", "TotalDistance", c => c.Int(nullable: false));
            AddColumn("dbo.Routes", "TotalDuration", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Coords", "RouteId", "dbo.Routes");
            DropIndex("dbo.Coords", new[] { "RouteId" });
            DropColumn("dbo.Routes", "TotalDuration");
            DropColumn("dbo.Routes", "TotalDistance");
            DropTable("dbo.Coords");
        }
    }
}
