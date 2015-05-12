namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class added_route_start_time : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Routes", "StartTime", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Routes", "StartTime");
        }
    }
}
