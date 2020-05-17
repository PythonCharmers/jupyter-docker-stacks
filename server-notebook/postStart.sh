cp /tmp/.watchdog_tricks.yml ./

# Check if symlinks exist, if not, make them
# Avoids errors for each restart of server with persistent volume as home
# NOTE postStart hook runs in mounted/persistent home directory
if [ ! -L ./Data ]; then
        ln -s /home/data/Data ./Data
fi

if [ ! -L ./Trainer ]; then
        ln -s /home/shared/trainer ./Trainer
fi

if [ ! -L ./Materials ]; then
        ln -s /home/data/_Materials ./Materials
fi

# make the location for keyringrc.cfg
mkdir -p ~/.local/share/python_keyring/
cp -f /tmp/keyringrc.cfg .local/share/python_keyring/keyringrc.cfg

# copy over simple bashrc file for terminal usage
cp -f /tmp/.bashrc ./

# remove lost+found folder
rm -Rf $NB_USER/lost+found

# make Data and _Materials read-only (easy to bypass but prevents
# accidental modifications)
# chmod u-w $NB_USER/data/Data $NB_USER/data/_Materials

# last, as will return exit code "1" when supervisord already running
supervisord -c /etc/supervisor/supervisord.conf
