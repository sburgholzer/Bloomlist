# Requirements Document

## Introduction

Bloomlist is a gamified daily goal/task tracker web application. Users create a list of daily goals, and as they check off completed tasks, a visual garden grows and blooms on screen. The garden serves as a visual reward and motivation system, transforming mundane task completion into a satisfying, organic experience. Each day begins with a fresh garden plot, and the garden's state reflects the user's progress throughout the day.

## Glossary

- **App**: The Bloomlist web application
- **Task**: A single goal or to-do item created by the user for a given day
- **Task_List**: The ordered collection of tasks for a single day
- **Garden**: The visual representation of the user's daily progress, composed of Plant elements
- **Plant**: A single visual element in the Garden corresponding to one Task
- **Growth_Stage**: A discrete visual phase of a Plant (seed, sprout, budding, blooming)
- **Day**: A calendar day used to scope Task_Lists and Gardens

## Requirements

### Requirement 1: Create Daily Tasks

**User Story:** As a user, I want to create a list of daily goals, so that I can plan and track what I need to accomplish each day.

#### Acceptance Criteria

1. WHEN the user submits a new task with a non-empty title, THE App SHALL add the task to the current Day's Task_List and display it in the list.
2. THE App SHALL display all tasks in the Task_List in the order they were created.
3. WHEN the user creates a task, THE App SHALL assign a corresponding Plant to the Garden for that task.
4. IF the user submits a task with an empty title, THEN THE App SHALL display a validation message and not add the task.
5. THE App SHALL allow the user to create at least 10 tasks per Day.

### Requirement 2: Complete Tasks

**User Story:** As a user, I want to check off tasks when I complete them, so that I can track my progress and see my garden grow.

#### Acceptance Criteria

1. WHEN the user marks a task as complete, THE App SHALL visually distinguish the completed task from incomplete tasks in the Task_List.
2. WHEN the user marks a task as complete, THE App SHALL advance the corresponding Plant to its final Growth_Stage (blooming).
3. WHEN the user marks a previously completed task as incomplete, THE App SHALL revert the corresponding Plant to its initial Growth_Stage (seed).
4. THE App SHALL display the count of completed tasks relative to total tasks (e.g., "3 of 7 complete").

### Requirement 3: Visual Garden Display

**User Story:** As a user, I want to see a visual garden that reflects my task progress, so that I feel rewarded and motivated to complete my goals.

#### Acceptance Criteria

1. THE App SHALL display the Garden alongside the Task_List so both are visible simultaneously.
2. THE App SHALL render one Plant in the Garden for each task in the Task_List.
3. WHEN a task is incomplete, THE App SHALL display the corresponding Plant at the seed Growth_Stage.
4. WHEN a task is completed, THE App SHALL animate the corresponding Plant transitioning from seed to blooming Growth_Stage.
5. WHEN all tasks in the Task_List are completed, THE App SHALL display a celebratory visual effect on the Garden (e.g., particle animation, glow, or sparkle).

### Requirement 4: Plant Growth Stages

**User Story:** As a user, I want to see plants go through visible growth stages, so that the transition from incomplete to complete feels satisfying and rewarding.

#### Acceptance Criteria

1. THE App SHALL represent each Plant with four distinct Growth_Stages: seed, sprout, budding, and blooming.
2. WHEN a task is marked complete, THE App SHALL animate the Plant through all four Growth_Stages in sequence over a duration of 1 to 2 seconds.
3. WHEN a task is marked incomplete, THE App SHALL revert the Plant to the seed Growth_Stage immediately without reverse animation.
4. THE App SHALL render each Growth_Stage with visually distinct graphics (increasing size, color, and detail).

### Requirement 5: Daily Reset

**User Story:** As a user, I want a fresh garden each day, so that I can start each day with a clean slate and new motivation.

#### Acceptance Criteria

1. WHEN a new Day begins, THE App SHALL present an empty Task_List and a bare Garden plot.
2. THE App SHALL scope each Task_List and Garden to the current Day.
3. WHEN the user returns to the App on a new Day, THE App SHALL not carry over incomplete tasks from the previous Day.

### Requirement 6: Delete Tasks

**User Story:** As a user, I want to remove tasks I no longer need, so that my list and garden stay relevant to my actual goals.

#### Acceptance Criteria

1. WHEN the user deletes a task, THE App SHALL remove the task from the Task_List.
2. WHEN the user deletes a task, THE App SHALL remove the corresponding Plant from the Garden.
3. WHEN the user deletes a task, THE App SHALL update the completed/total task count.

### Requirement 7: Persist Daily State

**User Story:** As a user, I want my tasks and garden to be saved, so that I can close the browser and return without losing my progress for the current day.

#### Acceptance Criteria

1. WHEN the user creates, completes, or deletes a task, THE App SHALL persist the current Task_List state to local browser storage.
2. WHEN the user opens the App, THE App SHALL restore the Task_List and Garden state from local browser storage for the current Day.
3. IF no saved state exists for the current Day, THEN THE App SHALL display an empty Task_List and bare Garden plot.

### Requirement 8: Responsive Layout

**User Story:** As a user, I want to use Bloomlist on both desktop and mobile devices, so that I can track my goals wherever I am.

#### Acceptance Criteria

1. WHILE the viewport width is 768 pixels or wider, THE App SHALL display the Task_List and Garden side by side.
2. WHILE the viewport width is less than 768 pixels, THE App SHALL stack the Task_List above the Garden vertically.
3. THE App SHALL ensure all interactive elements (buttons, checkboxes) have a minimum touch target size of 44x44 pixels.
