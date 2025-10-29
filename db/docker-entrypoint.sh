#!/bin/bash
set -e

DATADIR="/var/lib/mysql"
INITDIR="/docker-entrypoint-initdb.d"

chown -R mysql:mysql /var/lib/mysql /var/run/mysqld

if [ ! -d "$DATADIR/mysql" ]; then
  echo ">> Initializing database..."
  mariadb-install-db --user=mysql --datadir="$DATADIR" --skip-test-db

  : "${MYSQL_DATABASE:=issue_tracker}"
  : "${MYSQL_USER:=app}"
  : "${MYSQL_PASSWORD:=app_password}"

  INITSQL="/tmp/init.sql"
  {
    echo "CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo "CREATE USER IF NOT EXISTS '$MYSQL_USER'@'%' IDENTIFIED BY '$MYSQL_PASSWORD';"
    echo "GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'%';"
    echo "FLUSH PRIVILEGES;"
  } > "$INITSQL"

  # Подхватываем все .sql из /docker-entrypoint-initdb.d
  if [ -d "$INITDIR" ]; then
    for f in $(ls -1 "$INITDIR"/*.sql 2>/dev/null || true); do
      echo "USE \`$MYSQL_DATABASE\`;" >> "$INITSQL"
      cat "$f" >> "$INITSQL"
      echo ";" >> "$INITSQL"
    done
  fi

  # пароль root (если задан)
  if [ -n "$MYSQL_ROOT_PASSWORD" ]; then
    {
      echo "ALTER USER 'root'@'localhost' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';"
      echo "FLUSH PRIVILEGES;"
    } >> "$INITSQL"
  fi

  set -- "$@" "--init-file=$INITSQL"
fi

echo ">> Starting MariaDB..."
exec "$@"
