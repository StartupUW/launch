Launch by Startup UW
==

## Overview
Launch is a web application built upon node.js, mongodb, jade, and React. It's integrated with Facebook for a seamless login flow. As of now, you can create a user profile, create projects, and view the projects others have posted.

## Upcoming Features/Unimplemented

### Dynamic editing
Use React to allow users to edit their own projects and profiles without having to leave the page. We need to be able to add and remove founders and edit content without having to go to the database.

### Email system
Use an email server to notify users when projects are approved, comments are made, projects are featured.

### Searchable content
Have a search bar to search for users and projects from any page. This would take a lot of work to scale.

### Comment system/notifications
Allow users to post comments and threads. Receive notifications when things you own are upvoted or replied to.

### Weekly featured startups
Either show 5 weekly featured startups on the main page or dedicate a specific page to features.

### Social Graph
Show how users are connected through some kind of large graph.

### Possible optimizations
- Dynamically fetch projects instead of fetching all at once
- Limit users 10 posts per day
- Make pages more responsive (show that there are no upvotes for a page)
