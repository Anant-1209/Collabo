using Microsoft.AspNetCore.SignalR;

namespace CollaboTask.Server.Hubs
{
    public class NotificationHub : Hub
    {
        // Users join a group based on ProjectId
        public async Task JoinProjectGroup(string projectId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, projectId);
        }

        // Users leave the group when switching projects
        public async Task LeaveProjectGroup(string projectId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, projectId);
        }
    }
}