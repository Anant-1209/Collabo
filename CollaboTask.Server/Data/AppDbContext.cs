using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Models;

namespace CollaboTask.Server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<ProjectTask> Tasks { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<ProjectMember> ProjectMembers { get; set; }
    }
}
