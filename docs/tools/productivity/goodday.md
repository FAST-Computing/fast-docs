---
outline: deep
---

# <img src="/logos/gooddaylogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;">GoodDay

https://www.goodday.work/

Welcome to the internal project management guidelines for **GoodDay**. This document outlines the hierarchy, board statuses, tracking conventions, and task ownership rules to ensure consistency and accurate time tracking across all teams.


## Project Hierarchy

To keep our workflows structured, GoodDay utilizes two main organizational models depending on the nature of the work.

### Project-Based Structure

For standard projects broken down into Work Packages (WPs) or specific execution phases:

* **RESOURCE** *(Project Name)*
  * **Work Project** *(WP or Phase)*
    * **Task** *(WP: Main Assignee)*
      * **Subtask** *(Implementation Task)*
        * **Checklist** *(Optional granular breakdown)*


### Non-Project / Macro Area Structure

For ongoing operations, continuous improvements, or non-project macro areas:

* **RESOURCE** *(Macro Area Name)*
  * **Macro Task** *(Intervention / Initiative)*
    * **Task** *(Intervention: Main Assignee)*
      * **Subtask** *(Implementation Task)*
        * **Checklist** *(Optional granular breakdown)*


## Team Allocation & Task Assignment Rules

### Initial Team Listing

At the start of every project, initial tasks must be placed at the root/top level to define and list the assigned team members:
> **Example:** `WP0: Pippo`, `WP0: Pluto`, `WP0: Paperoga`

### Dynamic Reassignment

* A dedicated set of developers will be assigned to each project to handle subtasks.
* **Reassignment Rule:** If a task is executed or implemented by a developer other than the originally assigned primary owner, **the task must be moved under the corresponding WP of the developer actually implementing it.**


## Mandatory Rules & Estimations

::: warning
Every single task located inside project folders **MUST contain an estimate**.
 
* **Why?** If any task is missing an estimate, the overall project folder will fail to calculate and display the total aggregated estimate.
* **Fallback:** If an exact estimate cannot be determined, set the estimate value to **`0`**.
:::


## Kanban Board & Workflow Statuses

### Available Board Columns

Our Kanban board uses the following standard workflow stages:

1. `Not Started`
2. `Continuous`
3. `MACRO In Progress`
4. `In Progress`
5. `Review`
6. `On Hold`
7. `Closed`


### Status Progression Rules

To prevent confusion and maintain visibility across parent and child items, follow this exact workflow:

```
[Start Task / WP] ---> Task & Parent Macro Task / WP set to "In Progress"
                                  |
                                  v
[All Subtasks in Review] ---> Parent Macro Task / WP moves to "Review"
                                  |
                                  v
[All Subtasks Closed]   ---> Parent Macro Task / WP moves to "Closed"
```

* **Starting Work:** As soon as work begins on a child Task (or Work Package), both the specific **Task** and its parent **Macro Task / WP** must be set to `In Progress`.
* **Moving to Review:** A parent **Macro Task / WP** transitions to `Review` only when **all** underlying tasks are in `Review`.
* **Closing Work:** A parent **Macro Task / WP** transitions to `Closed` only when **all** underlying tasks are marked `Closed`.


## Time Tracking & Logging Guidelines

Accurate time logging is essential for reporting and auditing.

* **Primary Method:** Always log worked hours directly on the **Subtask** level whenever possible.
* **Exception:** Time may be logged on the main **Task** level only in exceptional, justified circumstances.