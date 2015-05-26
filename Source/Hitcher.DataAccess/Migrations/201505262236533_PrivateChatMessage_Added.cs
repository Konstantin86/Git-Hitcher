namespace Hitcher.DataAccess.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class PrivateChatMessage_Added : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.PrivateChatMessages",
                c => new
                    {
                        Id = c.Int(nullable: false, identity: true),
                        FromUserId = c.String(),
                        ToUserId = c.String(),
                        UserName = c.String(),
                        Message = c.String(),
                        PhotoPath = c.String(),
                        Time = c.DateTime(nullable: false),
                    })
                .PrimaryKey(t => t.Id);
            
        }
        
        public override void Down()
        {
            DropTable("dbo.PrivateChatMessages");
        }
    }
}
