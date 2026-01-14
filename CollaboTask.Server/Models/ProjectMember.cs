using System.ComponentModel.DataAnnotations;

namespace CollaboTask.Server.Models
{
    public class ProjectMember
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ProjectId { get; set; } = string.Empty;

        [Required]
        public int UserId { get; set; }

        // Role in project: "Owner" or "Member"
        public string Role { get; set; } = "Member";

        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    }
}
