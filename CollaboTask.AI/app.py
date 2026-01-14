from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

@app.route('/api/ai/prioritize', methods=['POST'])
def prioritize():
    data = request.json
    title = data.get('title', '')
    description = data.get('description', '')
    
    # Combine text for analysis
    text = f"{title} {description}".lower()
    
    # NLP logic: Check for urgency keywords
    high_priority_words = ['urgent', 'critical', 'asap', 'immediately', 'blocker']
    medium_priority_words = ['update', 'improve', 'scheduled', 'soon']
    
    if any(word in text for word in high_priority_words):
        priority = "High"
    elif any(word in text for word in medium_priority_words):
        priority = "Medium"
    else:
        priority = "Low"
        
    return jsonify({"suggestedPriority": priority})

@app.route('/api/ai/workload', methods=['POST'])
def analyze_workload():
    """
    Analyze team workload distribution and suggest task reassignments
    Input: { users: [...], tasks: [...] }
    """
    data = request.json
    users = data.get('users', [])
    tasks = data.get('tasks', [])
    
    # Calculate tasks per user
    user_task_count = {}
    for user in users:
        user_name = user.get('name', '')
        user_task_count[user_name] = 0
    
    for task in tasks:
        assignee = task.get('assignee') or task.get('Assignee')
        if assignee and assignee in user_task_count:
            user_task_count[assignee] += 1
    
    # Calculate average and identify overloaded/underloaded
    if not user_task_count:
        return jsonify({"analysis": [], "recommendations": []})
    
    total_tasks = sum(user_task_count.values())
    avg_tasks = total_tasks / len(user_task_count) if user_task_count else 0
    
    analysis = []
    overloaded = []
    underloaded = []
    
    for user, count in user_task_count.items():
        status = "balanced"
        if count > avg_tasks * 1.5:
            status = "overloaded"
            overloaded.append(user)
        elif count < avg_tasks * 0.5:
            status = "underloaded"
            underloaded.append(user)
        
        analysis.append({
            "user": user,
            "taskCount": count,
            "status": status,
            "percentOfAverage": round((count / avg_tasks * 100) if avg_tasks > 0 else 0, 1)
        })
    
    # Generate recommendations
    recommendations = []
    if overloaded and underloaded:
        for ol in overloaded:
            for ul in underloaded:
                recommendations.append(f"Consider reassigning tasks from {ol} to {ul}")
    
    return jsonify({
        "analysis": analysis,
        "recommendations": recommendations,
        "averageTasksPerUser": round(avg_tasks, 1),
        "totalTasks": total_tasks
    })

@app.route('/api/ai/predict-timeline', methods=['POST'])
def predict_timeline():
    """
    Predict project completion based on historical velocity
    Input: { tasks: [...], projectName: "..." }
    """
    data = request.json
    tasks = data.get('tasks', [])
    project_name = data.get('projectName', 'Project')
    
    # Count tasks by status
    todo_count = 0
    in_progress_count = 0
    done_count = 0
    
    for task in tasks:
        status = task.get('status') or task.get('Status', '')
        if status == 'To Do':
            todo_count += 1
        elif status == 'In Progress':
            in_progress_count += 1
        elif status == 'Done':
            done_count += 1
    
    total_tasks = todo_count + in_progress_count + done_count
    
    # Calculate completion percentage
    completion_percentage = (done_count / total_tasks * 100) if total_tasks > 0 else 0
    
    # Estimate remaining days (simple heuristic)
    remaining_tasks = todo_count + in_progress_count
    # Assume 2 tasks completed per day on average
    velocity = 2
    estimated_days = remaining_tasks / velocity if velocity > 0 else 0
    
    predicted_completion = datetime.now() + timedelta(days=estimated_days)
    
    # Risk assessment
    risk_level = "Low"
    if completion_percentage < 25 and remaining_tasks > 10:
        risk_level = "High"
    elif completion_percentage < 50 and remaining_tasks > 5:
        risk_level = "Medium"
    
    return jsonify({
        "projectName": project_name,
        "totalTasks": total_tasks,
        "completedTasks": done_count,
        "inProgressTasks": in_progress_count,
        "todoTasks": todo_count,
        "completionPercentage": round(completion_percentage, 1),
        "estimatedDaysRemaining": round(estimated_days, 1),
        "predictedCompletionDate": predicted_completion.strftime("%Y-%m-%d"),
        "riskLevel": risk_level,
        "velocityPerDay": velocity
    })

if __name__ == '__main__':
    app.run(port=5001)