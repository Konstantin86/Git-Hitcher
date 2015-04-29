namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class ExtendedRoute : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Routes", "PhotoPath", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Routes", "PhotoPath");
        }
    }
}
