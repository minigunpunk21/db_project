FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends mariadb-server mariadb-client ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# слушаем все интерфейсы для связи в docker-сети
RUN sed -ri 's/^(bind-address\s*=).*/\1 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf && \
    printf "\n[mysqld]\ncharacter-set-server=utf8mb4\ncollation-server=utf8mb4_unicode_ci\n" \
      > /etc/mysql/mariadb.conf.d/99-charset.cnf

RUN mkdir -p /var/run/mysqld && chown -R mysql:mysql /var/run/mysqld /var/lib/mysql

VOLUME ["/var/lib/mysql"]

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3306
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["mariadbd","--user=mysql","--datadir=/var/lib/mysql","--bind-address=0.0.0.0","--character-set-server=utf8mb4","--collation-server=utf8mb4_unicode_ci"]
