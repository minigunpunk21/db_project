USE `issue_tracker`;
-- Create indexes only if not exists (via information_schema)
SET @idx := 'ix_tasks_project_status_due';
SELECT COUNT(*) INTO @exists FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='tasks' AND index_name=@idx;
SET @sql = IF(@exists=0,'CREATE INDEX ix_tasks_project_status_due ON tasks (project_id, status, due_date)','SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx := 'ix_tasks_assignee_status';
SELECT COUNT(*) INTO @exists FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='tasks' AND index_name=@idx;
SET @sql = IF(@exists=0,'CREATE INDEX ix_tasks_assignee_status ON tasks (assignee_id, status)','SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx := 'ix_tasks_project_due';
SELECT COUNT(*) INTO @exists FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='tasks' AND index_name=@idx;
SET @sql = IF(@exists=0,'CREATE INDEX ix_tasks_project_due ON tasks (project_id, due_date)','SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx := 'ix_comments_task_created';
SELECT COUNT(*) INTO @exists FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='comments' AND index_name=@idx;
SET @sql = IF(@exists=0,'CREATE INDEX ix_comments_task_created ON comments (task_id, created_at)','SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx := 'ix_timeentries_task_date';
SELECT COUNT(*) INTO @exists FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='timeentries' AND index_name=@idx;
SET @sql = IF(@exists=0,'CREATE INDEX ix_timeentries_task_date ON timeentries (task_id, work_date)','SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

SET @idx := 'ix_logs_entity_time';
SELECT COUNT(*) INTO @exists FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='logs' AND index_name=@idx;
SET @sql = IF(@exists=0,'CREATE INDEX ix_logs_entity_time ON logs (entity_type, entity_id, occurred_at)','SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
