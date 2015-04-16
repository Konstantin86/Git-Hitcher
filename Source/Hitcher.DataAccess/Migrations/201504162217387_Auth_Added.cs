namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Auth_Added : DbMigration
    {
        public override void Up()
        {
            AddColumn("dbo.AspNetUsers", "Gender", c => c.String());
            DropColumn("dbo.AspNetUsers", "Sex");
        }
        
        public override void Down()
        {
            AddColumn("dbo.AspNetUsers", "Sex", c => c.String());
            DropColumn("dbo.AspNetUsers", "Gender");
        }
    }
}
