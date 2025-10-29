USE `issue_tracker`;
DELIMITER $$
DROP TRIGGER IF EXISTS trg_tasks_ai_log $$
CREATE TRIGGER trg_tasks_ai_log AFTER INSERT ON tasks FOR EACH ROW
BEGIN
  INSERT INTO logs (occurred_at, actor_id, entity_type, entity_id, action, details_json)
  VALUES (NOW(3), COALESCE(@actor_id, NEW.reporter_id), 'task', NEW.task_id, 'create',
          JSON_OBJECT('title', NEW.title, 'status', NEW.status, 'priority', NEW.priority, 'project_id', NEW.project_id));
END $$
DROP TRIGGER IF EXISTS trg_tasks_au_log $$
CREATE TRIGGER trg_tasks_au_log AFTER UPDATE ON tasks FOR EACH ROW
BEGIN
  IF (NEW.status <=> OLD.status) = 0 THEN
    INSERT INTO logs (occurred_at, actor_id, entity_type, entity_id, action, details_json)
    VALUES (NOW(3), COALESCE(@actor_id, NEW.assignee_id), 'task', NEW.task_id, 'status_change', JSON_OBJECT('from', OLD.status, 'to', NEW.status));
  END IF;
  IF (NEW.assignee_id <=> OLD.assignee_id) = 0 THEN
    INSERT INTO logs (occurred_at, actor_id, entity_type, entity_id, action, details_json)
    VALUES (NOW(3), COALESCE(@actor_id, NEW.assignee_id), 'task', NEW.task_id, 'reassign', JSON_OBJECT('from', OLD.assignee_id, 'to', NEW.assignee_id));
  END IF;
END $$
DELIMITER ;