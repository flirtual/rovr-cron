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
. /var/www/kwerc/app/es/email.es

cd $kwerc_root

for (user = `{redis graph read 'MATCH (a:user)-[w:WAVED {email: true}]->(b:user {email_wave: ''digest''})
                                RETURN DISTINCT b.username' | sed '/^\(empty list or set\)$/d'}) {
    numwaves = `{redis graph write 'MATCH (a:user)-[w:WAVED {email: true}]->(b:user {username: '''$user'''})
                                    RETURN count(a)'}
    if {~ $numwaves 1} {
        numwaves = Someone
        profiles = profile
    } {
        numwaves = $numwaves' people'
        profiles = profiles
    }

    newfriends = ()
    for (friend = `{redis graph write 'MATCH (a:user {username: '''$user'''})-[f:FRIENDS {new: true}]-(b:user)
                                       RETURN b.username' | sed '/^\(empty list or set\)$/d'}) {
        displayname = `{redis_html `{redis graph read 'MATCH (u:user {username: '''$friend'''}) RETURN u.displayname'}}
        newfriends = ($newfriends '<p><a href="https://rovrapp.com/'$friend'">'$^displayname'</a></p>')
    }
    if {! isempty $newfriends} {
        if {~ $#newfriends 1} {
            newfriends = ('<p>You''ve made a new friend too!</p>' $newfriends)
        } {
            newfriends = ('<p>You''ve made some new friends too!</p>' $newfriends)
        }
    }

    sed 's|\$numwaves|'$^numwaves'|; s|\$profiles|'$^profiles'|; s|\$newfriends|'$^newfriends'|' < mail/wavedigest | email $user 'People want to meet you!'
}

redis graph write 'MATCH (a:user)-[w:WAVED]->(b:user)
                   SET w.email = NULL'
redis graph write 'MATCH (a:user)-[f:FRIENDS]->(b:user)
                   SET w.new = NULL'
