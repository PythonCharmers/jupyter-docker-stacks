cp /tmp/.watchdog_tricks.yml ./

# Check if symlinks exist, if not, make them
# Avoids errors for each restart of server with persistent volume as home
# NOTE postStart hook runs in mounted/persistent home directory
if [ ! -L ./Data ]; then
        ln -s /home/data/Data ./Data
fi

if [ ! -L ./trainer ]; then
        ln -s /home/shared/trainer ./trainer
fi

if [ ! -L ./_Materials ]; then
        ln -s /home/data/_Materials ./_Materials
fi

# make the location for keyringrc.cfg
mkdir -p ~/.local/share/python_keyring/
cp -f /tmp/keyringrc.cfg .local/share/python_keyring/keyringrc.cfg


# last, as will return exit code "1" when supervisord already running
supervisord -c /etc/supervisor/supervisord.conf
