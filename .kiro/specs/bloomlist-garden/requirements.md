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

1. WHEN the user submits a new task with a non-empty, non-whitespace-only title, THE App SHALL add the task to the current Day's Task_List and display it in the list.
2. THE App SHALL display all tasks in the Task_List in the order they were created.
3. WHEN the user creates a task, THE App SHALL assign a corresponding Plant to the Garden for that task.
4. IF the user submits a task with an empty or whitespace-only title, THEN THE App SHALL display a validation message and not add the task.
5. THE App SHALL enforce a maximum task title length of 150 characters and SHALL prevent the user from entering additional characters beyond this limit.
6. THE App SHALL allow the user to create up to 20 tasks per Day.
7. IF the user attempts to create a task when 20 tasks already exist for the current Day, THEN THE App SHALL display a message indicating the daily task limit has been reached and SHALL NOT add the task.

### Requirement 2: Complete Tasks

**User Story:** As a user, I want to check off tasks when I complete them, so that I can track my progress and see my garden grow.

#### Acceptance Criteria

1. WHEN the user marks a task as complete, THE App SHALL visually distinguish the completed task from incomplete tasks in the Task_List by applying a strikethrough style to the task title and displaying a checked state on the task's toggle control.
2. WHEN the user marks a task as complete, THE App SHALL advance the corresponding Plant to its final Growth_Stage (blooming).
3. WHEN the user marks a previously completed task as incomplete, THE App SHALL revert the corresponding Plant to its initial Growth_Stage (seed).
4. WHEN the user marks a task as complete or incomplete, THE App SHALL immediately update the displayed count of completed tasks relative to total tasks (e.g., "3 of 7 complete").
5. THE App SHALL ensure the completed/incomplete state of each task is perceivable without relying solely on color (e.g., by using strikethrough text, a checked indicator, or iconography).

### Requirement 3: Visual Garden Display

**User Story:** As a user, I want to see a visual garden that reflects my task progress, so that I feel rewarded and motivated to complete my goals.

#### Acceptance Criteria

1. THE App SHALL display the Garden alongside the Task_List so both are visible simultaneously.
2. THE App SHALL render one Plant in the Garden for each task in the Task_List.
3. WHILE a task is incomplete, THE App SHALL display the corresponding Plant at the seed Growth_Stage.
4. WHEN a task is completed, THE App SHALL animate the corresponding Plant transitioning from seed to blooming Growth_Stage.
5. WHEN all tasks in the Task_List are completed and the Task_List contains at least one task, THE App SHALL display a celebratory visual effect on the Garden lasting between 2 and 5 seconds.
6. IF a task is marked incomplete after the celebratory visual effect has been triggered, THEN THE App SHALL remove the celebratory visual effect from the Garden.

### Requirement 4: Plant Growth Stages

**User Story:** As a user, I want to see plants go through visible growth stages, so that the transition from incomplete to complete feels satisfying and rewarding.

#### Acceptance Criteria

1. THE App SHALL represent each Plant with four distinct Growth_Stages: seed, sprout, budding, and blooming.
2. WHEN a task is marked complete, THE App SHALL animate the Plant through all four Growth_Stages in sequence over a total duration of 1 to 2 seconds, spending an approximately equal portion of time on each stage transition.
3. IF a task's completion state changes while a growth animation is in progress, THEN THE App SHALL cancel the current animation and apply the new target state (blooming if completed, seed if incomplete) within 150 milliseconds.
4. WHEN a task is marked incomplete and no animation is in progress, THE App SHALL revert the Plant to the seed Growth_Stage within a single frame (no animated transition).
5. THE App SHALL render each Growth_Stage with graphics that differ from the adjacent stage in at least two of the following attributes: size, color, and shape or structural detail.

### Requirement 5: Daily Reset

**User Story:** As a user, I want a fresh garden each day, so that I can start each day with a clean slate and new motivation.

#### Acceptance Criteria

1. WHEN the device's local calendar date advances to a new Day, THE App SHALL present an empty Task_List and a bare Garden plot for that new Day.
2. THE App SHALL scope each Task_List and Garden to the current Day, determined by the device's local calendar date (midnight 00:00:00 local time as the boundary).
3. WHEN the user returns to the App on a new Day, THE App SHALL not display tasks or Plant states from any previous Day.
4. IF the user is actively using the App when the Day boundary (midnight local time) is crossed, THEN THE App SHALL present the new Day's empty Task_List and bare Garden plot upon the user's next interaction with the App.

### Requirement 6: Delete Tasks

**User Story:** As a user, I want to remove tasks I no longer need, so that my list and garden stay relevant to my actual goals.

#### Acceptance Criteria

1. THE App SHALL display a delete control on each task in the Task_List.
2. WHEN the user activates the delete control for a task, THE App SHALL request confirmation before removing the task.
3. WHEN the user confirms task deletion, THE App SHALL remove the task from the Task_List.
4. WHEN the user confirms task deletion, THE App SHALL remove the corresponding Plant from the Garden.
5. WHEN the user confirms task deletion, THE App SHALL update the completed/total task count to reflect the remaining tasks.
6. IF the user deletes the last remaining task in the Task_List, THEN THE App SHALL display an empty Task_List and a bare Garden plot.

### Requirement 7: Persist Daily State

**User Story:** As a user, I want my tasks and garden to be saved, so that I can close the browser and return without losing my progress for the current day.

#### Acceptance Criteria

1. WHEN the user creates, completes, or deletes a task, THE App SHALL persist the current Task_List state (including each task's title, order, and completion status) to local browser storage before the next user interaction is accepted.
2. WHEN the user opens the App, THE App SHALL restore the Task_List from local browser storage for the current Day, displaying all tasks in their saved order with their saved completion status and corresponding Plants at the appropriate Growth_Stages.
3. IF no saved state exists for the current Day, THEN THE App SHALL display an empty Task_List and bare Garden plot.
4. IF local browser storage is unavailable or the write fails due to quota limits, THEN THE App SHALL display a warning message indicating that progress may not be saved and SHALL allow the user to continue using the App without interruption.
5. IF saved state for the current Day is corrupted or cannot be parsed, THEN THE App SHALL discard the invalid data and display an empty Task_List and bare Garden plot.

### Requirement 8: Responsive Layout

**User Story:** As a user, I want to use Bloomlist on both desktop and mobile devices, so that I can track my goals wherever I am.

#### Acceptance Criteria

1. WHILE the viewport width is 768 pixels or wider, THE App SHALL display the Task_List on the left and the Garden on the right, side by side.
2. WHILE the viewport width is less than 768 pixels, THE App SHALL stack the Task_List above the Garden vertically, with each section occupying the full viewport width without requiring horizontal scrolling.
3. THE App SHALL ensure all interactive elements (buttons, checkboxes) have a minimum touch target size of 44x44 pixels.
4. WHEN the viewport width crosses the 768-pixel threshold due to resizing, THE App SHALL adapt the layout between side-by-side and stacked arrangements without requiring a page reload.
