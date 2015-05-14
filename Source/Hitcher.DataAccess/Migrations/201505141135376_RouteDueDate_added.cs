namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class RouteDueDate_added : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Routes", "DueDate", c => c.DateTime(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Routes", "DueDate");
        }
    }
}
