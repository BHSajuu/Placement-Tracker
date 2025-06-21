# 🚀 Advanced MAANG Placement Preparation Tracker

This is a smart and personalized preparation tracker for MAANG aspirants, built using modern tech stacks. It helps users set 60-day goals, track daily progress, and visualize skill-based completion for cracking top tech company interviews.

---


## 🔥 Features

### 🧠 Personalized Goal Setting
- On first login, users can define 60-day goals for:
  - DSA (Data Structures & Algorithms)
  - Web Development
  - Data Science
  - CS Fundamentals
  - System Design
  - English Speaking
  - Mock Interviews
- Once set, goals can be updated anytime via an “Edit Goals” button.

### ✅ Context-Aware Task Management
- The task input form adapts based on selected skill category:
  - DSA: Enter number of questions.
  - Web Dev: Choose between "Project" or "Daily Task".
  - Data Science: Enter number of tutorials or project names.
  - CS Fundamentals / System Design: Enter topic or case study name.
  - English / Mock Interviews: Specify number of sessions completed.

### 📊 Dynamic Skill Progress Tracking
- Progress is tracked based on **actual goals**:
  - DSA: Progress = Questions solved / Questions planned
  - Web Dev: Daily task frequency or project completion
  - CS, Data Science, System Design: Match topics or case studies from the goal list
  - English / Mock Interviews: Based on sessions completed

 ## 🧰 Tech Stack

- ⚛️ **React** – Used for building component logic 
- 🎨 **Tailwind CSS** – For consistent UI styling
- 🧠 **Convex** – To persist user goal data

---

## 🚀Getting Started
   
   visit:- https://advanced-placement-preparation-trac.vercel.app/



# Future updates
need modifications  :
1. Update Goal feature is not working ,means after updating an existing or adding a new goal for a spcefic categories,its not reflected back to progressTracker.tsx .

2. In ProgressTracker.tsx , the data for DSA summary, DSA topic wise progress and data science topic wise are stores temporarily because once the task a completed ,its reflect back to Progresstacker.tsx but after refreshing the page all the data are reset to default values .

3. In Dashboard.tsx the current streak like data are not updating .

4. New Journey button not working properly.

5. Remove level and xp related all UI and data 

6. Add toast notification for new journey, task add, task remove and update Goal .