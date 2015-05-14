namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Route_Recurrency_modified : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.RouteRecurrencies", "Id");
        }
        
        public override void Down()
        {
            AddColumn("dbo.RouteRecurrencies", "Id", c => c.Int(nullable: false));
        }
    }
}
