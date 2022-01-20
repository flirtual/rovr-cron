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

new_users = `{redis graph read 'MATCH (u:user) WHERE u.genguestlist = true RETURN u.username'}
if {! isempty $new_users} {
    for (user = $new_users) {
        redis graph write 'MATCH (u:user {username: '''$user'''}) SET u.genguestlist = ''pending'''
    }
    for (user = $new_users) {
        compute_user_matches $user
        redis graph write 'MATCH (u:user {username: '''$user'''}) SET u.genguestlist = NULL'
    }
}
