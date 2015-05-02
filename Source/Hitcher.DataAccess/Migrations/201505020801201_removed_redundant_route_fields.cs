namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class removed_redundant_route_fields : DbMigration
    {
        public override void Up()
        {
            DropColumn("dbo.Routes", "Name");
            DropColumn("dbo.Routes", "Phone");
            DropColumn("dbo.Routes", "PhotoPath");
        }
        
        public override void Down()
        {
            AddColumn("dbo.Routes", "PhotoPath", c => c.String());
            AddColumn("dbo.Routes", "Phone", c => c.String());
            AddColumn("dbo.Routes", "Name", c => c.String());
        }
    }
}
