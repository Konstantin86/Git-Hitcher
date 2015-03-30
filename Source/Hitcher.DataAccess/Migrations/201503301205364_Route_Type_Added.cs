namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Route_Type_Added : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.Routes", "Type", c => c.Int(nullable: false));
        }
        
        public override void Down()
        {
            DropColumn("dbo.Routes", "Type");
        }
    }
}
