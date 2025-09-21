USE volo_africa_comm;

INSERT INTO roles (role_name) VALUES ('Admin'), ('Department Manager'), ('Staff');

INSERT INTO departments (dept_name) VALUES ('Operations'), ('Finance'), ('HR'), ('Engineering'), ('Sales');

INSERT INTO users (name, email, password_hash, role_id, department_id) VALUES
('Alice Admin','admin@volo.africa', '$2b$12$A2kJfHeQq9dXoQYg8m2mUO8c9z9Y2cJ2V0bJ9U3Qf1KfH2o7m3mKe', 1, 1), -- bcrypt placeholder
('Mark Manager','manager.ops@volo.africa', '$2b$12$ud3m3b5C1e2n6FqKQ6mR3u1JvQ9cQk5T3iGf7e9V2dXz1y4h6j9pS', 2, 1),
('Eve Engineer','eve@volo.africa', '$2b$12$X9lPpI6uYWQ5YH3rW9q3.e2M8zYyDqGQGQk5v9X3yZ7aT1j2h4bKq', 3, 4),
('Sam Sales','sam.sales@volo.africa', '$2b$12$X9lPpI6uYWQ5YH3rW9q3.e2M8zYyDqGQGQk5v9X3yZ7aT1j2h4bKq', 3, 5);

-- tasks
INSERT INTO tasks (task_title, task_desc, assigned_to, assigned_by, dept_id, status, due_date)
VALUES
('Prepare Q3 Ops Report','Compile KPIs and incidents for Q3', 2, 1, 1, 'in_progress', DATE_ADD(CURDATE(), INTERVAL 7 DAY)),
('Deploy Feature X','Deploy and monitor Feature X to staging', 3, 1, 4, 'pending', DATE_ADD(CURDATE(), INTERVAL 3 DAY));

-- messages
INSERT INTO messages (sender_id, receiver_id, dept_id, message_body) VALUES
(2, NULL, 1, 'Daily standup at 9:00 EAT. Please join the Ops huddle room.'),
(3, NULL, 4, 'Reminder: code freeze Thursday 5pm EAT.');

-- notifications
INSERT INTO notifications (user_id, type, message) VALUES
(2, 'task_assigned', 'New task assigned: Prepare Q3 Ops Report'),
(3, 'task_assigned', 'New task assigned: Deploy Feature X');

-- logs
INSERT INTO logs (action, user_id) VALUES
('User login', 1),
('Task created: Prepare Q3 Ops Report', 1),
('Message posted in Ops channel', 2);
