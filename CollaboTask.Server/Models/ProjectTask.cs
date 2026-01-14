using System.ComponentModel.DataAnnotations;

namespace CollaboTask.Server.Models
{
    public class ProjectTask
    {
        [Key]
        public string TaskId { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string Status { get; set; } = "To Do";

        public string Priority { get; set; } = "Medium";

        public DateTime? DueDate { get; set; }

        public string? Assignee { get; set; }

        // Keep only this one version of ProjectId
        // Making it nullable (string?) prevents "No Data" errors in React 
        // when a task isn't assigned to a project yet
        public string? ProjectId { get; set; }
        public string? Creator { get; set; }
    }
}