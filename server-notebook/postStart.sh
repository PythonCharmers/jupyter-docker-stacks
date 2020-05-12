
mv /tmp/.watchdog_tricks.yml /home/$NB_USER/.watchdog_tricks.yml

supervisord -c /etc/supervisor/supervisord.conf
