#!/var/www/kwerc/bin/es

path = (/var/www/kwerc/bin /usr/local/bin /usr/bin /bin)
kwerc_root = /var/www/kwerc/app
dateun = `{date -un}

. /var/www/kwerc/app/config
. /var/www/kwerc/app/es/cgi.es
. /var/www/kwerc/app/es/util.es
. /var/www/kwerc/app/es/redis.es
. /var/www/kwerc/app/es/rgauth.es
. /var/www/kwerc/app/es/matchmaking.es

compute_all_matches
