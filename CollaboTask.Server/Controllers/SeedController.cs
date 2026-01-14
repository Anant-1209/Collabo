using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CollaboTask.Server.Data;
using CollaboTask.Server.Models;

namespace CollaboTask.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeedController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SeedController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// POST /api/seed/reset - Clear all data and seed with sample data
        /// </summary>
        [HttpPost("reset")]
        public async Task<IActionResult> ResetAndSeed()
        {
            try
            {
                // ================= STEP 1: CLEAR ALL DATA =================
                _context.Comments.RemoveRange(_context.Comments);
                _context.Tasks.RemoveRange(_context.Tasks);
                _context.ProjectMembers.RemoveRange(_context.ProjectMembers);
                _context.ActivityLogs.RemoveRange(_context.ActivityLogs);
                _context.Documents.RemoveRange(_context.Documents);
                _context.Projects.RemoveRange(_context.Projects);
                _context.Users.RemoveRange(_context.Users);
                await _context.SaveChangesAsync();

                // ================= STEP 2: CREATE USERS WITH INDIAN NAMES =================
                var users = new List<User>
                {
                    new User { name = "Anant Sahu", email = "anantsahu1209@gmail.com", role = "Admin", profile_picture = null },
                    new User { name = "Priya Patel", email = "priya.patel@collabotask.com", role = "Project Manager", profile_picture = null },
                    new User { name = "Rahul Verma", email = "rahul.verma@collabotask.com", role = "Team Member", profile_picture = null },
                    new User { name = "Neha Gupta", email = "neha.gupta@collabotask.com", role = "Team Member", profile_picture = null },
                    new User { name = "Vikram Singh", email = "vikram.singh@collabotask.com", role = "Team Member", profile_picture = null }
                };
                _context.Users.AddRange(users);
                await _context.SaveChangesAsync();

                // Reload users to get their IDs
                users = await _context.Users.ToListAsync();

                // ================= STEP 3: CREATE SAMPLE PROJECTS =================
                var projects = new List<Project>
                {
                    new Project { ProjectId = Guid.NewGuid().ToString(), Name = "E-Commerce Platform", Description = "Building a modern e-commerce platform with React and .NET", Tags = "Frontend,Backend,API", Creator = "Anant Sahu", Status = "Active" },
                    new Project { ProjectId = Guid.NewGuid().ToString(), Name = "Mobile Banking App", Description = "Secure mobile banking application for iOS and Android", Tags = "Mobile,Security,FinTech", Creator = "Priya Patel", Status = "Active" },
                    new Project { ProjectId = Guid.NewGuid().ToString(), Name = "Healthcare Management System", Description = "Hospital management and patient tracking system", Tags = "Healthcare,Database,Reporting", Creator = "Anant Sahu", Status = "Active" },
                    new Project { ProjectId = Guid.NewGuid().ToString(), Name = "AI Chatbot Integration", Description = "Integrating AI-powered chatbot for customer support", Tags = "AI,ML,Automation", Creator = "Rahul Verma", Status = "Active" },
                    new Project { ProjectId = Guid.NewGuid().ToString(), Name = "HR Portal Redesign", Description = "Modernizing the HR portal with new UI/UX", Tags = "UI/UX,HR,Redesign", Creator = "Priya Patel", Status = "Active" },
                    new Project { ProjectId = Guid.NewGuid().ToString(), Name = "Inventory Management", Description = "Real-time inventory tracking and management system", Tags = "Inventory,Warehouse,Tracking", Creator = "Vikram Singh", Status = "Active" },
                    new Project { ProjectId = Guid.NewGuid().ToString(), Name = "Customer Feedback System", Description = "Collecting and analyzing customer feedback", Tags = "Feedback,Analytics,CRM", Creator = "Neha Gupta", Status = "Active" }
                };
                _context.Projects.AddRange(projects);
                await _context.SaveChangesAsync();

                // ================= STEP 4: ADD PROJECT MEMBERS =================
                var projectMembers = new List<ProjectMember>();
                foreach (var project in projects)
                {
                    // Add 3-4 random members to each project
                    var memberCount = new Random().Next(3, 5);
                    var shuffledUsers = users.OrderBy(x => Guid.NewGuid()).Take(memberCount).ToList();
                    
                    for (int i = 0; i < shuffledUsers.Count; i++)
                    {
                        projectMembers.Add(new ProjectMember
                        {
                            ProjectId = project.ProjectId,
                            UserId = shuffledUsers[i].user_id,
                            Role = i == 0 ? "Owner" : "Member",
                            JoinedAt = DateTime.UtcNow.AddDays(-new Random().Next(1, 30))
                        });
                    }
                }
                _context.ProjectMembers.AddRange(projectMembers);
                await _context.SaveChangesAsync();

                // ================= STEP 5: CREATE TASKS FOR EACH PROJECT =================
                var priorities = new[] { "Low", "Medium", "High" };
                var statuses = new[] { "To Do", "In Progress", "Done" };
                var taskTemplates = new List<(string title, string description)>
                {
                    ("Setup project repository", "Initialize Git repository and configure CI/CD pipeline"),
                    ("Design database schema", "Create ERD and define database tables"),
                    ("Create API endpoints", "Develop RESTful API endpoints for core functionality"),
                    ("Implement authentication", "Setup JWT-based authentication and authorization"),
                    ("Build UI components", "Create reusable React components for the application"),
                    ("Write unit tests", "Create comprehensive unit tests for all modules"),
                    ("Code review", "Review and approve pull requests from team members"),
                    ("Performance optimization", "Identify and fix performance bottlenecks"),
                    ("Documentation", "Write API documentation and user guides"),
                    ("Bug fixes", "Fix reported bugs and issues"),
                    ("Deploy to staging", "Deploy application to staging environment for testing"),
                    ("User acceptance testing", "Coordinate UAT with stakeholders")
                };

                var tasks = new List<ProjectTask>();
                var random = new Random();

                foreach (var project in projects)
                {
                    var projectMembersList = projectMembers.Where(pm => pm.ProjectId == project.ProjectId).ToList();
                    var taskCount = random.Next(4, 8); // 4-7 tasks per project
                    var shuffledTemplates = taskTemplates.OrderBy(x => Guid.NewGuid()).Take(taskCount).ToList();

                    foreach (var template in shuffledTemplates)
                    {
                        var assignedMember = projectMembersList[random.Next(projectMembersList.Count)];
                        var assignedUser = users.FirstOrDefault(u => u.user_id == assignedMember.UserId);

                        tasks.Add(new ProjectTask
                        {
                            TaskId = Guid.NewGuid().ToString(),
                            Title = template.title,
                            Description = template.description,
                            Priority = priorities[random.Next(priorities.Length)],
                            Status = statuses[random.Next(statuses.Length)],
                            ProjectId = project.ProjectId,
                            DueDate = DateTime.UtcNow.AddDays(random.Next(1, 30)),
                            Assignee = assignedUser?.name,
                            Creator = project.Creator
                        });
                    }
                }
                _context.Tasks.AddRange(tasks);
                await _context.SaveChangesAsync();

                // ================= STEP 6: CREATE ACTIVITY LOGS =================
                var activityLogs = new List<ActivityLog>();
                foreach (var project in projects)
                {
                    activityLogs.Add(new ActivityLog
                    {
                        ProjectId = project.ProjectId,
                        User = project.Creator,
                        Message = $"created project: {project.Name}",
                        Type = "ProjectCreated",
                        Timestamp = DateTime.UtcNow.AddDays(-random.Next(1, 15))
                    });
                }
                foreach (var task in tasks.Take(10)) // Sample activity for first 10 tasks
                {
                    activityLogs.Add(new ActivityLog
                    {
                        ProjectId = task.ProjectId,
                        User = task.Creator ?? "System",
                        Message = $"created task: {task.Title}",
                        Type = "TaskCreated",
                        Timestamp = DateTime.UtcNow.AddDays(-random.Next(1, 10))
                    });
                }
                _context.ActivityLogs.AddRange(activityLogs);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Database reset and seeded successfully!",
                    users = users.Count,
                    projects = projects.Count,
                    tasks = tasks.Count,
                    projectMembers = projectMembers.Count,
                    activityLogs = activityLogs.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stack = ex.StackTrace });
            }
        }
    }
}
