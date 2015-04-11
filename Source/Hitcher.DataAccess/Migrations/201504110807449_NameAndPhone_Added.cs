namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class NameAndPhone_Added : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Routes", "Name", c => c.String());
            AddColumn("dbo.Routes", "Phone", c => c.String());
        }
        
        public override void Down()
        {
            DropColumn("dbo.Routes", "Phone");
            DropColumn("dbo.Routes", "Name");
        }
    }
}
